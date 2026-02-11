import { Module, MiddlewareConsumer } from '@nestjs/common';
import { authMiddleware } from './auth/auth.middleware';

@Module({
  imports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authMiddleware).forRoutes('*');
  }
}