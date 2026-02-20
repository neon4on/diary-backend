import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { AuthModule } from './auth/auth.module';
import { jwtMiddleware } from './auth/jwt.middleware';

@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtMiddleware).forRoutes('*');
  }
}