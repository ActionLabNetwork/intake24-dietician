export const resetPassword = {
  title: 'Reset your password',
  subtitle:
    'Enter a new password to be used for your Intake24 Dietician account.',
  form: {
    password: {
      label: 'New Password',
      placeholder: '********',
    },
    confirmPassword: {
      label: 'Confirm new password',
      placeholder: '********',
    },
    resetPassword: 'Reset password',
    success: {
      title: 'Your password has been reset successfully.',
      text: 'You can now login with your new password.',
    },
    error: {
      title: 'Reset password failed',
      text: 'Invalid credentials. Please try again with a different one.',
    },
  },
}
