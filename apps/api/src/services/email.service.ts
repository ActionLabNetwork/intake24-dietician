import nodemailer from 'nodemailer'
import { singleton } from 'tsyringe'
import { env } from '../config/env'

@singleton()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.MAILTRAP_HOST,
    port: env.MAILTRAP_PORT,
    auth: {
      user: env.MAILTRAP_USER,
      pass: env.MAILTRAP_PASS,
    },
  })

  public sendPasswordResetEmail = async (email: string, resetUrl: string) => {
    await this.transporter.sendMail({
      from: '"Intake24-Dietician" <intake24-dietician@example.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `Hello, please use the following link to reset your password: ${resetUrl}`,
      html: `<p>Hello,</p><p>Please use the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    })
  }
}
