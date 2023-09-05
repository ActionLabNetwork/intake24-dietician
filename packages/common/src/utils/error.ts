import { ApiResponseWithError } from '../types/api'

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export const generateErrorResponse = (
  status: string,
  title: string,
  error: unknown,
): ApiResponseWithError => {
  let detail = 'An unknown error occurred'
  if (typeof error === 'string') {
    detail = error
  } else if (error instanceof Error) {
    detail = error.message
  }

  return {
    errors: [{ status, title, detail }],
  }
}
