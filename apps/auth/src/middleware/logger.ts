import { env } from '../config/env'
import path from 'path'
import pino from 'pino'

export const createLogger = (name = '') =>
  pino({
    name: name || 'app',
    enabled: !env.LOGGER_DISABLED,
    level: 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: ['req.headers.authorization', 'res.headers'],
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname,filename',
        translateTime: 'SYS:standard',
      },
    },
  }).child({ filename: path.basename(__filename) })
