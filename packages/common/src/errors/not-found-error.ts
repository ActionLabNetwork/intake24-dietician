import { BaseError } from './base-error'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'

export class NotFoundError extends BaseError {
  // eslint-disable-next-line max-params
  public constructor(
    name: string,
    httpCode = StatusCodes.NOT_FOUND,
    description = getReasonPhrase(httpCode),
    isOperational = true,
  ) {
    super(name, httpCode, description, isOperational)
  }
}
