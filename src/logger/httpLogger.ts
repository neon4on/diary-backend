import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { logger } from './logger';

export const httpLogger = pinoHttp({

  logger,

  genReqId: (req: any) => {
    const id = crypto.randomUUID();
    req.id = id;
    return id;
  },

  customLogLevel: (req, res, err) => {

    if (err || res.statusCode >= 500) return 'error';

    if (res.statusCode >= 400) return 'warn';

    return 'info';
  },

  customSuccessMessage(req, res) {

    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage(req, res, err) {

    return `${req.method} ${req.url} ERROR`;
  },

  customProps: (req: any) => ({
    reqId: req.id,
    userId: req.session?.user?.id ?? null
  }),

  serializers: {

    req(req) {
      return {
        method: req.method,
        url: req.url
      };
    },

    res(res) {
      return {
        status: res.statusCode
      };
    }

  },

  quietReqLogger: true,
  quietResLogger: true

});