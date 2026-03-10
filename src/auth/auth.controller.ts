import { Controller, Get, Req, Post, Body, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

@Controller('auth')
export class AuthController {

  @Get('me')
  getMe(@Req() req: any) {

    if (!req.session.user) {
      throw new UnauthorizedException();
    }

    return {
      id: req.session.user.id,
      name: req.session.user.name,
      roleId: req.session.user.roleId,
    };
  }

  @Post('pin')
  async loginByPin(@Body('pin') pin: string, @Req() req: any) {

    if (!pin) {
      return { error: 'PIN_REQUIRED' };
    }

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
        validateStatus: (status) => status === 302,
      },
    );

    const location = authorizeResponse.headers.location;
    const code = new URL(location).searchParams.get('code');

    if (!code) {
      return { error: 'NO_CODE_FROM_SSO' };
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

    const user = userResponse.data;

    req.session.user = {
      id: user.id,
      name: user.name,
      roleId: user.roleId,
    };

    return { success: true };
  }

  @Post('logout')
  logout(@Req() req: any) {
    req.session.destroy(() => {});
    return { success: true };
  }
}