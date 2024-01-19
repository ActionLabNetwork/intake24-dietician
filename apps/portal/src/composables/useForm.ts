// useForm.ts
import { computed, ref, watch } from 'vue'
import { ToastPluginApi } from 'vue-toast-notification'
import type { ZodType } from 'zod'
import { DEFAULT_ERROR_MESSAGE } from '../constants'
import { MutateFunction } from '@tanstack/vue-query'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'

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
export const useForm = <TInitial, TSubmit>({
  initialValues,
  schema,
  $toast,
  mutationFn,
  onSuccess,
  onError,
}: {
  initialValues: TInitial
  schema: ZodType
  $toast?: ToastPluginApi
  mutationFn: MutateFunction<unknown, unknown, TSubmit, unknown>
  onSuccess?: () => void
  onError?: (err: string) => void
}) => {
  interface SubmitHandler {
    (validationData: TSubmit): Promise<void>
    (validationData: Partial<TSubmit>, submissionData: TSubmit): Promise<void>
  }

  const formValues = ref<TInitial>(initialValues)
  const isServerDataLoaded = ref(false)
  const serverDataSnapshot = ref<TInitial>(cloneDeep(initialValues))

  const isDirty = computed(
    () => !isEqual(formValues.value, serverDataSnapshot.value),
  )

  const isFormValid = (validationData: Partial<TSubmit>) => {
    return schema.safeParse(validationData).success
  }

  const handleFormUpdate = <TFormValues extends keyof typeof formValues.value>(
    property: TFormValues,
    value: (typeof formValues.value)[TFormValues],
  ) => {
    console.log({ property, value })
    formValues.value[property] = value
  }

  const handleSubmit: SubmitHandler = async (
    validationData: Partial<TSubmit>,
    submissionData?: TSubmit,
  ): Promise<void> => {
    // If submissionData is not provided, use validationData as submissionData
    // eslint-disable-next-line no-param-reassign
    submissionData = submissionData ?? (validationData as TSubmit)

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
      onError: () => {
        $toast?.error(DEFAULT_ERROR_MESSAGE)
        onError?.(DEFAULT_ERROR_MESSAGE)
      },
    })
  }

  watch(
    isServerDataLoaded,
    newLoad => {
      console.log({ newLoad })
      console.log({ serverDataSnapshot, formValues })
      serverDataSnapshot.value = cloneDeep(formValues.value)
    },
    { immediate: true },
  )

  watch(
    serverDataSnapshot,
    newSnapshot => {
      console.log({ newSnapshot })
    },
    { immediate: true },
  )

  return {
    formValues,
    isFormValid,
    handleFormUpdate,
    handleSubmit,
    isDirty,
    isServerDataLoaded,
    serverDataSnapshot,
  }
}
