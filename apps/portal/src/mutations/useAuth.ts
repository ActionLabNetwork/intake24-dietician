import { useMutation } from '@tanstack/vue-query'
import axios from 'axios'
import { env } from '../config/env'
import {
  AuthRequest,
  AuthResponse,
} from '@intake24-dietician/common/types/auth'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'

export const useRegister = () => {
  const registerUri = `${env.AUTH_API_HOST}/auth/register`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AuthResponse,
    ApiResponseWithError,
    AuthRequest
  >({
    mutationFn: registerBody => axios.post(registerUri, registerBody),
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useLogin = () => {}
