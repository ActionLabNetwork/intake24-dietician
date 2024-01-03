import { useMutation } from '@tanstack/vue-query'
import { DieticianCreateDto } from '@intake24-dietician/common/entities-new/user.dto'
import { useClientStore } from '../trpc/trpc'

export const useRegister = () => {
  const { register } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: async (registerBody: { email: string; password: string }) =>
        await register(registerBody),
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
  const { login } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (loginBody: { email: string; password: string }) => {
        return login(loginBody)
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
  const { publicClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (email: { email: string }) =>
        publicClient.authDietician.forgotPassword.mutate(email),
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
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (data: { password: string; token: string }) =>
      authenticatedClient.authDietician.resetPassword.mutate(data),
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
  const { logout } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: () => logout(),
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
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (updateProfileBody: {
        emailAddress: string
        dieticianProfile: Partial<DieticianCreateDto>
      }) => {
        const { emailAddress, dieticianProfile } = updateProfileBody
        return authenticatedClient.dieticianProfile.updateProfile.mutate({
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

export const useRequestEmailChange = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (generateTokenBody: { newEmail: string }) =>
      authenticatedClient.dieticianProfile.requestEmailChange.mutate(
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

export const useVerifyEmail = () => {
  const { publicClient } = useClientStore()
  return useMutation({
    mutationFn: (token: string) =>
      publicClient.dieticianProfile.verifyEmail.mutate({ token }),
  })
}

export const useUploadAvatar = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (uploadAvatarBody: { avatarBase64: string }) => {
      const formData = new FormData()
      formData.append('fileBase64', uploadAvatarBody.avatarBase64)
      return authenticatedClient.dieticianProfile.uploadAvatar.mutate(
        uploadAvatarBody,
      )
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
