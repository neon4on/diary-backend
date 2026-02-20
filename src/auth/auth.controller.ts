import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

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
}