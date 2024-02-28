import { singleton } from 'tsyringe'
import nodemailer from 'nodemailer'
import { resolveLogger } from '../di/di.config'

export interface EmailServiceConfig {
  smtp: {
    host: string
    port: number
    auth: {
      user: string
      pass: string
    }
  }
  fromAddress: string
  portalBaseUrl: string
}

@singleton()
export class EmailService {
  private transporter
  private logger = resolveLogger().child({ name: EmailService.name })

  public constructor(private readonly config: EmailServiceConfig) {
    this.transporter = nodemailer.createTransport(config.smtp)
  }

  public sendPasswordResetEmail = async (email: string, token: string) => {
    const resetUrl = `${this.config.portalBaseUrl}/auth/reset-password?token=${token}`
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Hello, please use the following link to reset your password: ${resetUrl}`,
      html: `<p>Hello,</p><p>Please use the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    })
  }

  public sendEmailVerificationEmail = async (email: string, token: string) => {
    const verificationUrl = `${this.config.portalBaseUrl}/auth/verify-email?token=${token}`
    await this.sendEmail({
      to: email,
      subject: 'Email Verification',
      text: `Hello, please use the following link to verify your email: ${verificationUrl}`,
      html: `<p>Hello,</p><p>Please use the following link to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
    })
  }

  public sendEmailChangeEmail = async (email: string, token: string) => {
    const verificationUrl = `${this.config.portalBaseUrl}/auth/verify-email?token=${token}`
    await this.sendEmail({
      to: email,
      subject: 'Email Verification',
      text: `Hello, please use the following link to verify your email change: ${verificationUrl}`,
      html: `<p>Hello,</p><p>Please use the following link to verify your email change:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
    })
  }

  public sendWelcomeEmail = async (email: string) => {
    await this.sendEmail({
      to: email,
      subject: 'Welcome Email',
      text: `Hello, Welcome to Intake24 Dietician.`,
      html: `<p>Hello, Welcome to Intake24 Dietician.</p>`,
    })
  }

  public sendReminderEmail = async (email: string, startSurveyUrl: string) => {
    await this.sendEmail({
      to: email,
      subject: 'Reminder to complete your recall on Intake24',
      text: `Hello, please click the following link to complete your daily recall: ${startSurveyUrl}`,
      html: `<p>Hello, please click the following link to complete your daily recall: <a href="${startSurveyUrl}">Start Survey</a></p>`,
    })
  }

  public sendFeedbackEmail = async (
    email: string,
    feedbackAttachment: Buffer,
  ) => {
    await this.sendEmail({
      to: email,
      subject: 'Feedback on your recall(s)',
      text: 'Hello, here is your feedback',
      html: `<p>Hello, here is your feedback:</p>`,
      attachments: [
        { fileName: 'YourFeedback.pdf', path: 'feedback-outputs/feedback.pdf' },
      ],
    })
  }

  private sendEmail = async (args: {
    to: string
    subject: string
    text: string
    html: string
    attachments?: {
      fileName: string
      path: string
    }[]
  }) => {
    this.logger.info(
      {
        to: args.to,
        subject: args.subject,
        text: args.text,
      },
      'Sending email',
    )
    await this.transporter.sendMail({
      from: this.config.fromAddress,
      ...args,
    })
  }
}
