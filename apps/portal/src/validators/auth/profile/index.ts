import { z } from 'zod'

export const mobileNumberValidator = (v: string): boolean | string => {
  if (!v) return 'Mobile number is required'

  const MobileNumber = z.string().refine(
    value => {
      const trimmedValue = value.startsWith('+') ? value.substring(1) : value

      const isNumeric = /^\d+$/.test(trimmedValue)

      const isLengthValid =
        trimmedValue.length >= 10 && trimmedValue.length <= 15

      return isNumeric && isLengthValid
    },
    {
      message: 'Invalid mobile number',
    },
  )

  const result = MobileNumber.safeParse(v)

  if (!result.success) {
    return result.error.issues[0]?.message ?? false
  }
  return true
}
