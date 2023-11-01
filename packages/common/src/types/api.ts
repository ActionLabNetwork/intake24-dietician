import type { IRecallExtended } from './recall';
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
  getRecallById: (id: string) => Promise<Result<IRecallExtended | null>>
  createRecall: (newRecall: IRecallExtended) => Promise<Result<string | null>>
}
