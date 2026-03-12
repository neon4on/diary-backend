import pino from 'pino';
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create log directory', e);
}

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const appStream = pino.destination({
  dest: path.join(LOG_DIR, 'app.log'),
  sync: false
});

const errorStream = pino.destination({
  dest: path.join(LOG_DIR, 'error.log'),
  sync: false
});

export const logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    base: undefined,

    timestamp: pino.stdTimeFunctions.isoTime,

    formatters: {
      level(label) {
        return { level: label };
      }
    }
  },
  appStream
);

export const errorLogger = pino(
  {
    level: 'error',
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
  },
  errorStream
);