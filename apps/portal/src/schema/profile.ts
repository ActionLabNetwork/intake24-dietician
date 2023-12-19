import { z } from 'zod'
import { MAX_FILE_SIZE } from '../constants'
import { createFormSchema } from '../types/validation.types'
import { MobileNumberSchema } from './common'

export const avatarSchema = z.number().lt(MAX_FILE_SIZE, {
  message: `Max image size is ${MAX_FILE_SIZE / 100000}MB.`,
})

export const contactDetailsSchema = createFormSchema(
  [
    'emailAddress',
    'mobileNumber',
    'businessNumber',
    'businessAddress',
  ] as const,
  {
    emailAddress: z.string().email(),
    mobileNumber: MobileNumberSchema,
    businessNumber: z.string(),
    businessAddress: z.string(),
  },
)
