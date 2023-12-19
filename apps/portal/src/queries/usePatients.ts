import { useQuery } from '@tanstack/vue-query'
// import { getDefaultAvatar } from '../utils/profile'
import trpcClient from '../trpc/trpc'

export const usePatients = (surveyId: string) => {
  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['patients'],
    queryFn: () => {
      return trpcClient.dieticianPatient.getPatients.query({
        surveyId: Number(surveyId),
      })
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

// export const usePatientById = (userId: string) => {
//   const queryClient = useQueryClient()
//   const sessionUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_GET_PATIENTS}/${userId}`

//   const { data, isLoading, isError, error, isSuccess } = useQuery<
//     unknown,
//     AxiosError<ApiResponseWithError>,
//     AxiosResponse<{
//       data: Omit<UserDTO, 'password'> & {
//         deletionDate: Date
//       }
//     }>
//   >({
//     queryKey: [userId],
//     queryFn: async () => {
//       const response: AxiosResponse<{
//         data: Omit<UserDTO, 'password'>
//       }> = await axios.get(sessionUri)

//       const avatar =
//         response.data.data.patientProfile?.avatar ||
//         getDefaultAvatar(response.data.data.email)

//       response.data.data.patientProfile!.avatar = avatar
//       return response
//     },
//   })

//   const invalidatePatientByIdQuery = async () => {
//     await queryClient.invalidateQueries({ queryKey: [userId] })
//     await queryClient.refetchQueries({ queryKey: [userId] })
//   }

//   return {
//     data,
//     isLoading,
//     isError,
//     error,
//     isSuccess,
//     invalidatePatientByIdQuery,
//   }
// }
