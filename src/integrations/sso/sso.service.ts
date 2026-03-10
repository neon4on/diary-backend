import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);

  private dumpJar(jar: CookieJar) {
    try {
      const cookies = jar.serializeSync();
      return cookies?.cookies?.map(c => ({
        key: c.key,
        domain: c.domain,
        path: c.path,
        expires: c.expires,
      })) || [];
    } catch (e) {
      return { error: 'COOKIE_DUMP_FAILED' };
    }
  }

  private buildClient(jar: CookieJar): AxiosInstance {
    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
        timeout: 10000,
      })
    );

    // request interceptor
    client.interceptors.request.use((req) => {
      this.logger.log({
        step: 'HTTP_REQUEST',
        method: req.method,
        url: req.url,
        params: req.params,
        data: req.data,
        headers: req.headers,
      });
      return req;
    });

    // response interceptor
    client.interceptors.response.use((res) => {
      this.logger.log({
        step: 'HTTP_RESPONSE',
        status: res.status,
        url: res.config.url,
        headers: res.headers,
        data: typeof res.data === 'string'
          ? res.data.substring(0, 500) // чтобы не спамить лог
          : res.data,
      });
      return res;
    }, (err) => {
      this.logger.error({
        step: 'HTTP_ERROR',
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw err;
    });

    return client;
  }

  async loginByPin(pin: string) {

    this.logger.log({
      step: 'START_LOGIN',
      pin
    });

    const jar = new CookieJar();

    const client = this.buildClient(jar);

    /*
      STEP 1
      PIN auth
    */
    this.logger.log({
      step: 'STEP_1_AUTH_PIN',
      url: 'https://platoniks.ru/sso/auth',
      pin
    });

    const authResp = await client.get(
      'https://platoniks.ru/sso/auth',
      {
        params: { pin }
      }
    );

    this.logger.log({
      step: 'STEP_1_AUTH_RESPONSE',
      body: authResp.data,
      cookies: this.dumpJar(jar)
    });

    if (authResp.data !== 'ok') {
      this.logger.error({
        step: 'PIN_AUTH_FAILED',
        body: authResp.data
      });
      throw new Error('PIN_INVALID');
    }

    /*
      STEP 2
      AUTHORIZE
    */
    this.logger.log({
      step: 'STEP_2_AUTHORIZE_REQUEST',
      params: {
        client_id: 'diary',
        redirect_uri: 'https://diary.platoniks.ru/cb',
        response_type: 'code',
        audience: 11
      }
    });

    const authorizeResp = await client.get(
      'https://platoniks.ru/sso/authorize',
      {
        params: {
          client_id: 'diary',
          redirect_uri: 'https://diary.platoniks.ru/cb',
          response_type: 'code',
          audience: 11
        },
        maxRedirects: 0,
        validateStatus: () => true
      }
    );

    this.logger.log({
      step: 'STEP_2_AUTHORIZE_RESPONSE',
      status: authorizeResp.status,
      headers: authorizeResp.headers,
      cookies: this.dumpJar(jar)
    });

    const location = authorizeResp.headers.location;

    this.logger.log({
      step: 'STEP_2_REDIRECT_LOCATION',
      location
    });

    if (!location) {
      this.logger.error({
        step: 'AUTHORIZE_NO_REDIRECT'
      });
      throw new Error('SSO_NO_REDIRECT');
    }

    const code = new URL(
      location,
      'https://diary.platoniks.ru'
    ).searchParams.get('code');

    this.logger.log({
      step: 'STEP_2_CODE_EXTRACTED',
      code
    });

    if (!code) {
      this.logger.error({
        step: 'CODE_NOT_FOUND_IN_REDIRECT',
        location
      });
      throw new Error('NO_CODE_FROM_SSO');
    }

    /*
      STEP 3
      TOKEN
    */
    this.logger.log({
      step: 'STEP_3_TOKEN_REQUEST',
      payload: {
        grant_type: 'authorization_code',
        code,
        client_id: 'diary',
        redirect_uri: 'https://diary.platoniks.ru/cb'
      }
    });

    const tokenResp = await client.post(
      'https://platoniks.ru/sso/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: 'diary',
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: 'https://diary.platoniks.ru/cb'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.logger.log({
      step: 'STEP_3_TOKEN_RESPONSE',
      data: tokenResp.data
    });

    const accessToken = tokenResp.data?.access_token;

    if (!accessToken) {
      this.logger.error({
        step: 'ACCESS_TOKEN_MISSING',
        tokenResponse: tokenResp.data
      });
      throw new Error('NO_ACCESS_TOKEN');
    }

    /*
      STEP 4
      JWT decode
    */
    this.logger.log({
      step: 'STEP_4_DECODE_JWT',
      tokenPreview: accessToken.substring(0, 40)
    });

    const payload: any = jwt.decode(accessToken);

    this.logger.log({
      step: 'STEP_4_JWT_PAYLOAD',
      payload
    });

    if (!payload) {
      this.logger.error({
        step: 'JWT_DECODE_FAILED'
      });
      throw new Error('JWT_DECODE_FAILED');
    }

    const result = {
      id: payload.sub,
      name: payload.name,
      rights: payload.right,
      logins: payload.logins
    };

    this.logger.log({
      step: 'LOGIN_SUCCESS',
      result
    });

    return result;
  }
}