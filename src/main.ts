import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { env } from './config/env';
import { ValidationPipe } from '@nestjs/common';
import pino from 'pino';
import pinoHttp from 'pino-http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function bootstrap() {

  const logDir = path.join(process.cwd(), 'diary');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logger = pino({
    level: 'info',
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: {
            destination: path.join(logDir, 'app.log'),
          },
        },
        {
          target: 'pino/file',
          level: 'error',
          options: {
            destination: path.join(logDir, 'error.log'),
          },
        },
      ],
    },
  });

  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      name: env.sessionName,
      secret: 'sso-secret-placeholder',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.use(
    pinoHttp({
      logger,
      genReqId: (req: any) => {
        const id = crypto.randomUUID();
        req.id = id;
        return id;
      },
      customProps: (req: any) => ({
        requestId: req.id,
        userId: req.session?.user?.id ?? null,
      }),
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(env.port);

  logger.info(`Server started on port ${env.port}`);
}

bootstrap();