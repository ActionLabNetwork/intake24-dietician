import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { env } from '../config/env'
import {
  AuthResponse,
  DieticianProfileValues,
  UserAttributes,
} from '@intake24-dietician/common/types/auth'
import {
  ApiResponseWithData,
  ApiResponseWithError,
} from '@intake24-dietician/common/types/api'
import trpcClient from '../trpc/trpc'

axios.defaults.withCredentials = true

export const useRegister = () => {
  const { data, isLoading, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: async (registerBody: { email: string; password: string }) =>
        trpcClient.authDietician.register.mutate(registerBody),
    })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useLogin = () => {
  const { data, isLoading, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (loginBody: { email: string; password: string }) =>
        trpcClient.authDietician.login.mutate(loginBody),
    })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useForgotPassword = () => {}

export const useResetPassword = () => {
  const resetPasswordUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_RESET_PASSWORD_URI}`

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

export const useLogout = () => {
  const logoutUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_LOGOUT_URI}`

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

export const useUpdateProfile = () => {
  const profileUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_PROFILE_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<ApiResponseWithData<{ user: UserAttributes }>>,
    AxiosError<ApiResponseWithError>,
    { dieticianProfile: DieticianProfileValues }
  >({
    mutationFn: profileBody => {
      return axios.put(profileUri, profileBody)
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

export const useGenerateToken = () => {
  const generateTokenUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_GENERATE_TOKEN_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<ApiResponseWithData<{ token: string }>>,
    AxiosError<ApiResponseWithError>,
    { currentEmail: string; newEmail: string }
  >(generateTokenBody => {
    return axios.post(generateTokenUri, generateTokenBody)
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

export const useVerifyToken = () => {
  const verifyTokenUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_VERIFY_TOKEN_URI}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<ApiResponseWithData<{ tokenVerified: boolean }>>,
    AxiosError<ApiResponseWithError>,
    { token: string }
  >(verifyTokenBody => {
    return axios.post(verifyTokenUri, verifyTokenBody)
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

export const useUploadAvatar = () => {
  const uploadAvatarUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_UPLOAD_AVATAR}`

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<ApiResponseWithData<{ avatarBlob: string }>>,
    AxiosError<ApiResponseWithError>,
    { avatarBase64: string }
  >(uploadAvatarBody => {
    const formData = new FormData()
    formData.append('fileBase64', uploadAvatarBody.avatarBase64)
    return axios.put(uploadAvatarUri, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
