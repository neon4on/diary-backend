import { Injectable } from '@nestjs/common';
import { SsoService } from '../integrations/sso/sso.service';

@Injectable()
export class AuthService {

  constructor(private ssoService: SsoService) {}

  async login(pin: string) {
    return this.ssoService.loginByPin(pin);
  }

}