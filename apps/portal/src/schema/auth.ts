import { createFormSchema } from '@/types/validation.types'
import { z } from 'zod'

export const LoginSchema = createFormSchema(['email', 'password'] as const, {
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const ForgotPasswordSchema = createFormSchema(['email'] as const, {
  email: z.string().email(),
})

export const EmailSchema = z.object({ email: z.string().email() })
