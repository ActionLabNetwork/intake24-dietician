import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.VITE_AUTH_API_HOST

export const useAddPatient = () => {
  const addPatientUri = env.VITE_AUTH_API_CREATE_PATIENT

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    unknown,
    AxiosError<ApiResponseWithError>,
    PatientProfileValues
  >({
    mutationFn: body => axios.post(addPatientUri, body),
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
