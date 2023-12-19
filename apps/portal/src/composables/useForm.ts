// useForm.ts
import { ref } from 'vue'
import { ToastPluginApi } from 'vue-toast-notification'
import type { ZodType } from 'zod'
import { DEFAULT_ERROR_MESSAGE } from '../constants'
import { MutateFunction } from '@tanstack/vue-query'

/**
 * Custom hook for handling form logic.
 * @template T - The type of the form values.
 * @template TSubmit - The type of the form submission data.
 * @param {Object} options - The options for the hook.
 * @param {T} options.initialValues - The initial values for the form.
 * @param {ZodType} options.schema - The schema for form validation.
 * @param {ToastPluginApi} [options.$toast] - The toast plugin API for displaying notifications.
 * @param {MutateFunction<unknown, AxiosError<ApiResponseWithError>, TSubmit, unknown>} options.mutationFn - The mutation function for submitting the form data.
 * @param {Function} [options.onSuccess] - The callback function to be called on successful form submission.
 * @param {Function} [options.onError] - The callback function to be called when an error occurs during form submission.
 * @returns {Object} - An object containing the form values, form validation function, form update function, and form submission function.
 */
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
  mutationFn: MutateFunction<unknown, unknown, TSubmit, unknown>
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
    // Validate with zod
    const result = schema.safeParse(validationData)

    if (!result.success) {
      $toast?.error(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
      onError?.(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
      return
    }

    mutationFn(submissionData, {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: err => {
        console.log({ errFromUseForm: err })
        $toast?.error(DEFAULT_ERROR_MESSAGE)
        onError?.(DEFAULT_ERROR_MESSAGE)
      },
    })
  }

  return {
    formValues,
    isFormValid,
    handleFormUpdate,
    handleSubmit,
  }
}
