import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { getDefaultAvatar } from '../utils/profile'
import { UserDTO } from '@intake24-dietician/common/entities/user.dto'

export const usePatients = () => {
  const sessionUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_GET_PATIENTS}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<{
      data: (PatientProfileValues & { id: number; isArchived: boolean })[]
    }>
  >({
    queryKey: ['patients'],
    queryFn: () => {
      return axios.get(sessionUri)
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}

export const usePatientById = (userId: string) => {
  const queryClient = useQueryClient()
  const sessionUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_GET_PATIENTS}/${userId}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<{
      data: Omit<UserDTO, 'password'> & {
        deletionDate: Date
      }
    }>
  >({
    queryKey: [userId],
    queryFn: async () => {
      const response: AxiosResponse<{
        data: Omit<UserDTO, 'password'>
      }> = await axios.get(sessionUri)

      const avatar =
        response.data.data.patientProfile?.avatar ||
        getDefaultAvatar(response.data.data.email)

      response.data.data.patientProfile!.avatar = avatar
      return response
    },
  })

  const invalidatePatientByIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: [userId] })
    await queryClient.refetchQueries({ queryKey: [userId] })
  }

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    invalidatePatientByIdQuery,
  }
}
