import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { env } from '../config/env'
import {
  AuthRequest,
  AuthResponse,
} from '@intake24-dietician/common/types/auth'
import {
  ApiResponseWithData,
  ApiResponseWithError,
} from '@intake24-dietician/common/types/api'

axios.defaults.withCredentials = true

export const useRegister = () => {
  const registerUri = `${env.AUTH_API_HOST}${env.AUTH_API_REGISTER_URI}`

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
    AxiosResponse<
      ApiResponseWithData<{
        email: string
        jti: string
      }>
    >,
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

export const useForgotPassword = () => {
  const forgotPasswordUri = `${env.AUTH_API_HOST}${env.AUTH_API_FORGOT_PASSWORD_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiResponseWithError>,
    { email: string }
  >({
    mutationFn: forgotPasswordBody =>
      axios.post(forgotPasswordUri, forgotPasswordBody),
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
    { token: string; password: string }
  >({
    mutationFn: resetPasswordBody => {
      return axios.post(
        resetPasswordUri,
        { password: resetPasswordBody.password },
        {
          params: { token: resetPasswordBody.token },
        },
      )
    },
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

export const useSession = () => {
  const sessionUri = `${env.AUTH_API_HOST}${env.AUTH_API_SESSION_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<
      ApiResponseWithData<{ userWithToken: { token: { accessToken: string } } }>
    >,
    AxiosError<ApiResponseWithError>,
    { jti: string }
  >({
    mutationFn: sessionBody => {
      return axios.post(sessionUri, sessionBody)
    },
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

export const useLogout = () => {
  const logoutUri = `${env.AUTH_API_HOST}${env.AUTH_API_LOGOUT_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse,
    AxiosError<ApiResponseWithError>,
    {}
  >({
    mutationFn: () => axios.post(logoutUri),
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
