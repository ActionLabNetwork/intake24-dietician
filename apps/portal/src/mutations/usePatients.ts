import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type {
  PatientUpdateDto,
  PatientCreateDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import { useClientStore } from '../trpc/trpc'

export const useAddPatient = () => {
  const { authenticatedClient } = useClientStore()
  const mutation = useMutation({
    mutationFn: (body: {
      surveyId: string
      email: string
      patient: PatientCreateDto
    }) => {
      return authenticatedClient.dieticianPatient.createPatient.mutate({
        ...body,
        surveyId: Number(body.surveyId),
      })
    },
  })

  return {
    ...mutation,
  }
}

export const useUpdatePatient = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (body: {
        id: number
        email: string
        patient: Partial<PatientUpdateDto>
      }) => {
        return authenticatedClient.dieticianPatient.updatePatient.mutate(body)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['patients', 'userId'],
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

export const useSendRecallReminder = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { patientId: number }) =>
      authenticatedClient.dieticianPatient.sendRecallReminder.mutate(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [variables.patientId],
      })
    },
  })
}

// TODO: Implement delete and restore patient
// export const useDeletePatient = () => {
//   const deletePatientUri = env.VITE_AUTH_API_DELETE_PATIENT

//   const { data, isPending, isError, error, isSuccess, mutate } = useMutation<
//     unknown,
//     unknown,
//     number | undefined
//   >({
//     mutationFn: patientId => {
//       if (!patientId) {
//         throw new Error('patientId is undefined')
//       }

//       return axios.delete(
//         deletePatientUri.replace('{userId}', patientId.toString()),
//       )
//     },
//   })

//   return {
//     data,
//     isPending,
//     isError,
//     error,
//     isSuccess,
//     mutate,
//   }
// }

// export const useRestorePatient = () => {
//   const restorePatientUri = env.VITE_AUTH_API_RESTORE_PATIENT

//   const { data, isPending, isError, error, isSuccess, mutate } = useMutation<
//     unknown,
//     unknown,
//     number | undefined
//   >({
//     mutationFn: patientId => {
//       if (!patientId) {
//         throw new Error('patientId is undefined')
//       }

//       return axios.put(
//         restorePatientUri.replace('{userId}', patientId.toString()),
//       )
//     },
//   })

//   return {
//     data,
//     isPending,
//     isError,
//     error,
//     isSuccess,
//     mutate,
//   }
// }
