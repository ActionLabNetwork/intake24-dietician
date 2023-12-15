import { BaseError } from './base-error'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'

export class UnauthorizedError extends BaseError {
  // eslint-disable-next-line max-params
  public constructor(
    name: string,
    httpCode = StatusCodes.UNAUTHORIZED,
    description = getReasonPhrase(httpCode),
    isOperational = true,
  ) {
    super(name, httpCode, description, isOperational)
  }
}
