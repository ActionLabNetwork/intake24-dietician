import { TRPCError } from '@trpc/server'
export class NotFoundError extends TRPCError {
  public constructor(message: string) {
    super({
      code: 'NOT_FOUND',
      message: message,
    })
  }
}

export class UnauthorizedError extends TRPCError {
  public constructor(message: string) {
    super({
      code: 'UNAUTHORIZED',
      message: message,
    })
  }
}

export class ClientError extends TRPCError {
  public constructor(message: string) {
    super({
      code: 'BAD_REQUEST',
      message: message,
    })
  }
}
