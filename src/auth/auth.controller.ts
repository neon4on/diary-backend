import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

@Controller('auth')
export class AuthController {
    @Get('me')
    getMe(@Req() req: any) {
        return {
            authenticated: true,
            id: req.user.id,
            name: req.user.name,
            roleId: req.user.roleId,
        };
    }

    @Post('pin')
    async loginByPin(@Body('pin') pin: string) {

        if (!pin) {
            return { error: 'PIN_REQUIRED' };
        }

        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));

        // Логинимся по PIN
        await client.get(`https://platoniks.ru/sso/auth?pin=${pin}`);

        // Получаем redirect с code
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
            }
        );

        const location = authorizeResponse.headers.location;
        const code = new URL(location).searchParams.get('code');

        if (!code) {
            return { error: 'NO_CODE_FROM_SSO' };
        }

        // Обмен code на token
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
            }
        );

        return tokenResponse.data;
    }
}