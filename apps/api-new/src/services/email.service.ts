import { singleton } from 'tsyringe'
import nodemailer from 'nodemailer'

export interface EmailServiceConfig {
  smtp: {
    host: string
    port: number
    auth: {
      user: string
      pass: string
    }
  }
}

@singleton()
export class EmailService {
  private transporter

  public constructor(private readonly config: EmailServiceConfig) {
    this.transporter = nodemailer.createTransport(config.smtp)
  }

  public sendEmail = async (
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string,
  ) => {
    await this.transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
  }
}
