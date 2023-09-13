import { z } from 'zod'

export const emailValidator = (v: string): boolean | string => {
  const isValidEmail = z.string().email().safeParse(v)

  if (!v) return 'Email is required'
  if (!isValidEmail.success) {
    return 'Invalid email'
  }

  return true
}

export const passwordValidator = (v: string): boolean | string => {
  const isValidPassword = z.string().min(6).safeParse(v)

  if (!v) return 'Password is required'
  if (!isValidPassword.success) {
    return 'Password must be at least 6 characters'
  }

  return true
}

export const confirmPasswordValidator = (
  password: string,
  confirmPassword: string,
) => {
  if (!confirmPassword) return 'Confirm password is required'
  if (password !== confirmPassword) return 'Passwords do not match'

  return true
}
