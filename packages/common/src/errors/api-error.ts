import { BaseError } from './base-error'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'

export class APIError extends BaseError {
  // eslint-disable-next-line max-params
  public constructor(
    name: string,
    httpCode = StatusCodes.INTERNAL_SERVER_ERROR,
    description = getReasonPhrase(httpCode),
    isOperational = true,
  ) {
    super(name, httpCode, description, isOperational)
  }
}
