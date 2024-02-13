import { z } from 'zod'

// Mobile number schemas
const AustralianMobileSchema = z.string().regex(/^(\+61|0)4\d{8}$/, {
  message: 'Invalid mobile number format',
})

const IndonesianMobileSchema = z.string().regex(/^\+?628\d{8,11}$/)

const MalaysianMobileSchema = z.string().regex(/^01\d{7,8}$/)

export const MobileNumberSchema = z.union([
  AustralianMobileSchema,
  IndonesianMobileSchema,
  MalaysianMobileSchema,
])
