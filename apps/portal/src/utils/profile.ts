export const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0).toUpperCase()}${lastName
    .charAt(0)
    .toUpperCase()}`
}

export const getFullName = (firstName = '', lastName = '') => {
  return `${firstName} ${lastName}`.trim()
}
