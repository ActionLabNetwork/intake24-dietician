import path from 'path'
import pino from 'pino'
import { env } from '../config/env'
import TimeFn from 'pino'

const baseLogger = pino({
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
})

export type Logger = pino.Logger<{
  enabled: boolean
  level: string
  timestamp: typeof TimeFn
  redact: string[]
  transport: {
    target: string | undefined
    options: {
      colorize: boolean
      ignore: string
      translateTime: string
    }
  }
}>

export const createLogger = (name?: string | undefined): Logger => {
  if (env.LOGGER_DISABLED) {
    return pino({ enabled: false })
  }
  return baseLogger.child({
    name: name ?? 'app',
    filename: path.basename(__filename),
  })
}
