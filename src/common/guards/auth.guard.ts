import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!req.session?.user) {
      throw new UnauthorizedException();
    }

    req.user = req.session.user;

    return true;
  }
}