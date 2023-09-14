import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { env } from '../config/env'
import {
  AuthRequest,
  AuthResponse,
} from '@intake24-dietician/common/types/auth'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'

export const useRegister = () => {
  const registerUri = `${env.AUTH_API_HOST}${env.AUTH_API_REGISTER_URI}}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiResponseWithError>,
    AuthRequest
  >({
    mutationFn: async registerBody => axios.post(registerUri, registerBody),
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

export const useLogin = () => {
  const loginUri = `${env.AUTH_API_HOST}${env.AUTH_API_LOGIN_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiResponseWithError>,
    AuthRequest
  >({
    mutationFn: loginBody => axios.post(loginUri, loginBody),
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

export const useResetPassword = () => {
  const resetPasswordUri = `${env.AUTH_API_HOST}${env.AUTH_API_RESET_PASSWORD_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiResponseWithError>,
    AuthRequest
  >({
    mutationFn: resetPasswordBody =>
      axios.post(resetPasswordUri, resetPasswordBody),
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
