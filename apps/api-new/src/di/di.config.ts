import type { Logger } from 'pino';
import pino from 'pino'
import { container } from 'tsyringe'

export function registerLogger() {
  container.register('LOGGER', {
    useValue: pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
  })
}

export const resolveLogger = () => container.resolve<Logger>("LOGGER")
