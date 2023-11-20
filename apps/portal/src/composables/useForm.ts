// useForm.ts
import { ref } from 'vue'
import { ToastPluginApi } from 'vue-toast-notification'
import type { ZodType } from 'zod'
import { DEFAULT_ERROR_MESSAGE } from '../constants'
import { MutateFunction } from '@tanstack/vue-query'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { AxiosError } from 'axios'

export const useForm = <T extends {}, TSubmit>({
  initialValues,
  schema,
  $toast,
  mutationFn,
  onSuccess,
  onError,
}: {
  initialValues: T
  schema: ZodType
  $toast?: ToastPluginApi
  mutationFn: MutateFunction<
    unknown,
    AxiosError<ApiResponseWithError>,
    TSubmit,
    unknown
  >
  onSuccess?: () => void
  onError?: (err: string) => void
}) => {
  const formValues = ref<T>(initialValues)

  const isFormValid = (validationData: Partial<TSubmit>) => {
    return schema.safeParse(validationData).success
  }

  const handleFormUpdate = <TFormValues extends keyof typeof formValues.value>(
    property: TFormValues,
    value: (typeof formValues.value)[TFormValues],
  ) => {
    formValues.value[property] = value
  }

  const handleSubmit = async (
    validationData: Partial<TSubmit>,
    submissionData: TSubmit,
  ): Promise<void> => {
    console.log({ validationData, submissionData })
    return new Promise((resolve, reject) => {
      // Validate with zod
      const result = schema.safeParse(validationData)

      if (!result.success) {
        $toast?.error(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
        onError?.(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
        reject(new Error('Form validation failed'))
        return
      }

      mutationFn(submissionData, {
        onSuccess: () => {
          $toast?.success('Patient details updated')
          onSuccess?.()
          resolve()
        },
        onError: err => {
          $toast?.error(
            err.response?.data.error.detail ?? DEFAULT_ERROR_MESSAGE,
          )
          onError?.(err.response?.data.error.detail ?? DEFAULT_ERROR_MESSAGE)
        },
      })

      resolve()
    })
  }

  return {
    formValues,
    isFormValid,
    handleFormUpdate,
    handleSubmit,
  }
}
