import { BaseError } from './base-error'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'

export class ClientError extends BaseError {
  // eslint-disable-next-line max-params
  public constructor(
    name: string,
    httpCode = StatusCodes.BAD_REQUEST,
    description = getReasonPhrase(httpCode),
    isOperational = true,
  ) {
    super(name, httpCode, description, isOperational)
  }
}
