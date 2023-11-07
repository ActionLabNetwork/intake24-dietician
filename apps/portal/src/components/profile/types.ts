import { z } from 'zod'

export interface Layout {
  cols: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

type HTMLInputType =
  | 'text'
  | 'number'
  | 'password'
  | 'email'
  | 'search'
  | 'tel'
  | 'url'
  | 'hidden'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'time'
  | 'datetime'
  | 'color'
  | undefined

export type Form<TKeys extends string> = {
  [fieldName in TKeys]: FormEntry
}

export type FormSchema<TKeys extends string> = {
  [fieldName in TKeys]: z.ZodTypeAny
}

interface FormInput {
  // Identification
  key: string

  // Type information
  type: 'input'
  inputType?: HTMLInputType

  // Display properties
  label: string
  labelSuffix?: string
  class?: string
  suffixIcon?: string

  // Form behavior
  required?: boolean
  readonly?: boolean
  autocomplete?: AutoFill

  // Validation and event handling
  rules?: ((val: string) => boolean | string)[]
  handleUpdate: (val: string) => void
  handleSuffixIconClick?: () => void

  // Layout
  layout?: Layout
}

export type FormEntry = FormInput
