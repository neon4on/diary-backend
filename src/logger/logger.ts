import pino from 'pino'
import fs from 'fs'
import path from 'path'

const LOG_DIR = path.resolve(__dirname, '../../logs')

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const appStream = pino.destination({
  dest: path.join(LOG_DIR, 'app.log'),
  sync: true
})

const errorStream = pino.destination({
  dest: path.join(LOG_DIR, 'error.log'),
  sync: true
})

export const logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    base: null,

    timestamp: pino.stdTimeFunctions.isoTime,

    formatters: {
      level(label) {
        return { level: label }
      }
    }
  },
  appStream
)

export const errorLogger = pino(
  {
    level: 'error',
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime
  },
  errorStream
)