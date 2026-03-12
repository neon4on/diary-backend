import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { ValidationPipe } from '@nestjs/common';

import { env } from './config/env';
import { httpLogger } from './logger/httpLogger';
import { logger } from './logger/logger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.use(httpLogger);

  app.use(
    session({
      name: env.sessionName,
      secret: 'sso-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax'
      }
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  await app.listen(env.port);

  logger.info({
    event: 'server_started',
    port: env.port
  });
}

bootstrap();