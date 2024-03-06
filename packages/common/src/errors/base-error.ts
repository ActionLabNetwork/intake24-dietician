import type { StatusCodes } from 'http-status-codes'

export class BaseError extends Error {
  public override readonly name: string
  public readonly httpCode: StatusCodes
  public readonly isOperational: boolean

  // eslint-disable-next-line max-params
  public constructor(
    name: string,
    httpCode: StatusCodes,
    description: string,
    isOperational: boolean,
  ) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.httpCode = httpCode
    this.isOperational = isOperational

    // Error.captureStackTrace(this)
  }
}
