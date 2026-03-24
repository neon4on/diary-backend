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

  app.enableCors({
    origin: true,
    credentials: true,
  });

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

  await app.listen(3003);


  logger.info(`Server started on port 3003`);
  logger.info(`env.sessionName: ${env.sessionName}`);
}

bootstrap();