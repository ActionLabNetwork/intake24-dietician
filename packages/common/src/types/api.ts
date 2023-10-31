import type { Result } from './utils'
export interface ApiResponseWithData<T> {
  data: T
}

export interface ApiResponseWithError {
  error: { status: string; title: string; detail: string }
}

export interface ApiRequest<T> {
  data: T
}

export type ApiResponse<T> = ApiResponseWithData<T> | ApiResponseWithError

export interface IApiService {
  getRecallById: (id: string) => Promise<Result<any | null>>
  createRecall: () => Promise<Result<any | null>>
}
