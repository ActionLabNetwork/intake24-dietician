import { useMutation } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'
import { DieticianCreateDto } from '@intake24-dietician/common/entities-new/user.dto'

export const useRegister = () => {
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: async (registerBody: { email: string; password: string }) =>
        trpcClient.authDietician.register.mutate(registerBody),
    })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useLogin = () => {
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (loginBody: { email: string; password: string }) => {
        return trpcClient.authDietician.login.mutate(loginBody)
      },
    })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useForgotPassword = () => {
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (email: { email: string }) =>
        trpcClient.authDietician.forgotPassword.mutate(email),
    })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useResetPassword = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (data: { password: string; token: string }) =>
      trpcClient.authDietician.resetPassword.mutate(data),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useLogout = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: () => trpcClient.authDietician.logout.mutate(),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useUpdateProfile = () => {
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (updateProfileBody: {
        emailAddress: string
        dieticianProfile: Partial<DieticianCreateDto>
      }) => {
        const { emailAddress, dieticianProfile } = updateProfileBody
        return trpcClient.dieticianProfile.updateProfile.mutate({
          email: emailAddress,
          profile: dieticianProfile,
        })
      },
    })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useGenerateToken = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (generateTokenBody: {
      currentEmail: string
      newEmail: string
    }) =>
      trpcClient.dieticianProfile.generateChangeEmailToken.mutate(
        generateTokenBody,
      ),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useVerifyToken = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (verifyTokenBody: { token: string }) =>
      trpcClient.dieticianProfile.verifyChangeEmailToken.mutate(
        verifyTokenBody,
      ),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useUploadAvatar = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (uploadAvatarBody: { avatarBase64: string }) => {
      const formData = new FormData()
      formData.append('fileBase64', uploadAvatarBody.avatarBase64)
      return trpcClient.dieticianProfile.uploadAvatar.mutate(uploadAvatarBody)
      // return axios.put(uploadAvatarUri, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}
