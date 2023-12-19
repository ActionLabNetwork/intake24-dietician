import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import trpcClient from '../trpc/trpc'
import type { PatientCreateDto } from '@intake24-dietician/common/entities-new/user.dto'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.VITE_AUTH_API_HOST

export const useAddPatient = () => {
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: {
      surveyId: number
      email: string
      patient: PatientCreateDto
    }) => trpcClient.dieticianPatient.createPatient.mutate(body),
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

export const useUpdatePatient = () => {
  const updatePatientUri = env.VITE_AUTH_API_UPDATE_PATIENT

  const { data, isLoading, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation<
      unknown,
      AxiosError<ApiResponseWithError>,
      PatientProfileValues & { patientId: number }
    >({
      mutationFn: body => axios.put(updatePatientUri, body),
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

export const useDeletePatient = () => {
  const deletePatientUri = env.VITE_AUTH_API_DELETE_PATIENT

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    unknown,
    AxiosError<ApiResponseWithError>,
    number | undefined
  >({
    mutationFn: patientId => {
      if (!patientId) {
        throw new Error('patientId is undefined')
      }

      return axios.delete(
        deletePatientUri.replace('{userId}', patientId.toString()),
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

export const useRestorePatient = () => {
  const restorePatientUri = env.VITE_AUTH_API_RESTORE_PATIENT

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    unknown,
    AxiosError<ApiResponseWithError>,
    number | undefined
  >({
    mutationFn: patientId => {
      if (!patientId) {
        throw new Error('patientId is undefined')
      }

      return axios.put(
        restorePatientUri.replace('{userId}', patientId.toString()),
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
