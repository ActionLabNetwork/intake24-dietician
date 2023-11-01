import type { IEmailService } from '@intake24-dietician/common/types/auth'
import { env } from '../config/env'
import nodemailer from 'nodemailer'

export const createEmailService = (): IEmailService => {
  const transporter = nodemailer.createTransport({
    host: env.MAILTRAP_HOST,
    port: env.MAILTRAP_PORT,
    auth: {
      user: env.MAILTRAP_USER,
      pass: env.MAILTRAP_PASS,
    },
  })

  const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
    await transporter.sendMail({
      from: '"Intake24-Dietician" <intake24-dietician@example.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `Hello, please use the following link to reset your password: ${resetUrl}`,
      html: `<p>Hello,</p><p>Please use the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    })
  }

  return { sendPasswordResetEmail }
}
