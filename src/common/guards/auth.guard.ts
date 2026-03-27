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

    if (process.env.NODE_ENV === 'dev') {
        req.user = {
            id: 92,
            roleId: 2 
        };
        return true;
    }

    if (!req.session?.user) {
        throw new UnauthorizedException();
    }

    req.user = req.session.user

    return true;
  }
}