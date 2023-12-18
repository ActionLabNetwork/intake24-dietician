import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { env } from '../config/env'
import { UserAttributes } from '@intake24-dietician/common/types/auth'
import {
  ApiResponseWithData,
  ApiResponseWithError,
} from '@intake24-dietician/common/types/api'
import trpcClient from '../trpc/trpc'
import { DieticianCreateDto } from '@intake24-dietician/common/entities-new/user.dto'

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

export const useForgotPassword = () => {
  const { data, isLoading, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (email: { email: string }) =>
        trpcClient.authDietician.forgotPassword.mutate(email),
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

export const useResetPassword = () => {
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (data: { password: string; token: string }) =>
      trpcClient.authDietician.resetPassword.mutate(data),
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
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: () => trpcClient.authDietician.logout.mutate(),
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
    { dieticianProfile: DieticianCreateDto & { emailAddress: string } }
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
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation(
    (generateTokenBody: { currentEmail: string; newEmail: string }) =>
      trpcClient.dieticianProfile.generateChangeEmailToken.mutate(
        generateTokenBody,
      ),
  )

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
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation(
    (verifyTokenBody: { token: string }) =>
      trpcClient.dieticianProfile.verifyChangeEmailToken.mutate(
        verifyTokenBody,
      ),
  )

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
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation(
    (uploadAvatarBody: { avatarBase64: string }) => {
      const formData = new FormData()
      formData.append('fileBase64', uploadAvatarBody.avatarBase64)
      return trpcClient.dieticianProfile.uploadAvatar.mutate(uploadAvatarBody)
      // return axios.put(uploadAvatarUri, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })
    },
  )

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    mutate,
  }
}
