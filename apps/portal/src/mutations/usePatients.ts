import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import trpcClient from '../trpc/trpc'
import type {
  PatientUpdateDto,
  PatientCreateDto,
} from '@intake24-dietician/common/entities-new/user.dto'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.VITE_AUTH_API_HOST

export const useAddPatient = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: {
      surveyId: string
      email: string
      patient: PatientCreateDto
    }) => {
      return trpcClient.dieticianPatient.createPatient.mutate({
        ...body,
        surveyId: Number(body.surveyId),
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
  }
}

export const useUpdatePatient = () => {
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (body: {
        id: number
        email: string
        patient: Partial<PatientUpdateDto>
      }) => {
        return trpcClient.dieticianPatient.updatePatient.mutate(body)
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

export const useDeletePatient = () => {
  const deletePatientUri = env.VITE_AUTH_API_DELETE_PATIENT

  const { data, isPending, isError, error, isSuccess, mutate } = useMutation<
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
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useRestorePatient = () => {
  const restorePatientUri = env.VITE_AUTH_API_RESTORE_PATIENT

  const { data, isPending, isError, error, isSuccess, mutate } = useMutation<
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
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}
