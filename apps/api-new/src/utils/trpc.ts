import type { TRPCError } from '@trpc/server'
import { StatusCodes } from 'http-status-codes'

export function mapHttpCodeToTRPCCode(httpCode: number): TRPCError['code'] {
  switch (httpCode) {
    case StatusCodes.BAD_REQUEST:
      return 'BAD_REQUEST'
    case StatusCodes.UNAUTHORIZED:
      return 'UNAUTHORIZED'
    case StatusCodes.FORBIDDEN:
      return 'FORBIDDEN'
    case StatusCodes.NOT_FOUND:
      return 'NOT_FOUND'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}
