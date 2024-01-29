import { z } from 'zod'

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginDto = z.infer<typeof LoginDtoSchema>

export const RegisterDtoSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type RegisterDto = z.infer<typeof RegisterDtoSchema>
