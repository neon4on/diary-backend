import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Get('me')
  getMe(@Req() req: any) {

    if (!req.session?.user) {
      throw new UnauthorizedException();
    }

    return req.session.user;
  }

  @Post('pin')
  async login(@Body('pin') pin: string, @Req() req: any) {

    const user = await this.authService.loginByPin(pin);

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