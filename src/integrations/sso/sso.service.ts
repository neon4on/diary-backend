import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as jwt from 'jsonwebtoken';

import { logger } from '../../logger/logger';

@Injectable()
export class SsoService {

  async loginByPin(pin: string) {

    const jar = new CookieJar();

    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
        timeout: 8000
      })
    );

    /*
    AUTH
    */

    const authResp = await client.get(
      'https://platoniks.ru/sso/auth',
      { params: { pin } }
    );

    logger.info({
      step: 'SSO_AUTH',
      status: authResp.status
    });

    logger.info({
      step: 'client_secret',
      status: process.env.CLIENT_SECRET!,
    });

    if (authResp.data !== 'ok') {
      throw new Error('PIN_INVALID');
    }

    /*
    AUTHORIZE
    */

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
        validateStatus: s => s === 302
      }
    );

    logger.info({
      step: 'SSO_AUTHORIZE',
      status: authorizeResp.status
    });

    const location = authorizeResp.headers.location;

    if (!location) {
      throw new Error('SSO_NO_REDIRECT');
    }

    /*
    CODE
    */

    const code = new URL(
      location,
      'https://diary.platoniks.ru'
    ).searchParams.get('code');

    if (!code) {
      throw new Error('NO_CODE_FROM_SSO');
    }

    /*
    TOKEN
    */

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

    logger.info({
      step: 'SSO_TOKEN',
      status: tokenResp.status
    });

    const accessToken = tokenResp.data.access_token;

    if (!accessToken) {
      logger.error({
        step: 'SSO_TOKEN_FAIL',
        data: tokenResp.data
      });

      throw new Error('NO_ACCESS_TOKEN');
    }

    /*
    USER
    */

    const payload: any = jwt.decode(accessToken);

    logger.info({
      step: 'SSO_USER',
      id: payload?.sub,
      name: payload?.name
    });

    return {
      id: payload.sub,
      name: payload.name,
      rights: payload.right,
      logins: payload.logins
    };
  }
}