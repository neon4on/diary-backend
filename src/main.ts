import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      name: env.sessionName,
      secret: 'sso-secret-placeholder',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(env.port);
}

bootstrap();