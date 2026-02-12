import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Req() req: Request) {
    if (!req.session?.uid) {
        return { authenticated: false };
    }

    return {
        authenticated: true,
        uid: req.session.uid,
        roles: req.session.right,
        status: req.session.status,
    };
  }
}