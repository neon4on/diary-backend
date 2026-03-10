import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SsoService {

  private readonly log = new Logger('SSO');

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
    STEP 1 — AUTH
    */

    const authResp = await client.get(
      'https://platoniks.ru/sso/auth',
      { params: { pin } }
    );

    this.log.log(`AUTH status=${authResp.status} body=${authResp.data}`);

    if (authResp.data !== 'ok') {
      throw new Error('PIN_INVALID');
    }

    /*
    STEP 2 — AUTHORIZE
    */

    const authorizeResp = await client.get(
      'https://platoniks.ru/sso/authorize',
      {
        params: {
          client_id: 'diary',
          redirect_uri: 'https://diary.platoniks.ru/cb',
          response_type: 'code',
          audience: 4
        },
        maxRedirects: 0,
        validateStatus: () => true
      }
    );

    const location = authorizeResp.headers.location;

    this.log.log(`AUTHORIZE status=${authorizeResp.status} redirect=${location}`);

    if (!location) {
      throw new Error('SSO_NO_REDIRECT');
    }

    /*
    STEP 3 — CODE
    */

    const code = new URL(
      location,
      'https://diary.platoniks.ru'
    ).searchParams.get('code');

    this.log.log(`CODE ${code}`);

    if (!code) {
      throw new Error('NO_CODE_FROM_SSO');
    }

    /*
    STEP 4 — TOKEN
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

    this.log.log(`TOKEN status=${tokenResp.status}`);

    const accessToken = tokenResp.data.access_token;

    if (!accessToken) {
      this.log.error(JSON.stringify(tokenResp.data));
      throw new Error('NO_ACCESS_TOKEN');
    }

    /*
    STEP 5 — JWT
    */

    const payload: any = jwt.decode(accessToken);

    this.log.log(`USER id=${payload?.sub} name=${payload?.name}`);

    return {
      id: payload.sub,
      name: payload.name,
      rights: payload.right,
      logins: payload.logins
    };
  }
}