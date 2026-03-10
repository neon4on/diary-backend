import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SsoModule } from '../integrations/sso/sso.module';

@Module({
  imports: [SsoModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}