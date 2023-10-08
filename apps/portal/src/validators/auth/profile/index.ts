export const firstNameValidator = (v: string): boolean | string => {
  if (!v) return 'First name is required'
  return true
}
