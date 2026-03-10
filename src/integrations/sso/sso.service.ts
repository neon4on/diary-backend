import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export class SsoService {

  async loginByPin(pin: string) {

    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    await client.get(`https://platoniks.ru/sso/auth?pin=${pin}`);

    const authorizeResponse = await client.get(
      'https://platoniks.ru/sso/authorize',
      {
        params: {
          client_id: 'diary',
          redirect_uri: 'https://diary.platoniks.ru/cb',
          response_type: 'code',
          audience: 11,
        },
        maxRedirects: 0,
        validateStatus: (s) => s === 302,
      },
    );

    const location = authorizeResponse.headers.location;
    const code = new URL(location).searchParams.get('code');

    if (!code) {
      throw new Error('NO_CODE_FROM_SSO');
    }

    const tokenResponse = await client.post(
      'https://platoniks.ru/sso/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: 'diary',
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: 'https://diary.platoniks.ru/cb',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get(
      'https://platoniks.ru/sso/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return userResponse.data;
  }

}