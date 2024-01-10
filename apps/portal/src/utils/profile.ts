import defaultProfile from '@/assets/auth/default-profile.jpeg'

export const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0).toUpperCase()}${lastName
    .charAt(0)
    .toUpperCase()}`
}

export const getFullName = (firstName = '', lastName = '') => {
  return `${firstName} ${lastName}`.trim()
}

export const getDefaultAvatar = (): string => {
  return defaultProfile
}
