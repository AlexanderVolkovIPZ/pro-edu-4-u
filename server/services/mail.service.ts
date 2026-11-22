import { generateHtmlTemplate } from '@/app/utils/generate-html-template';
import nodemailer, { Transporter } from 'nodemailer';

export interface Mailer {
  sendVerificationEmail(to: string, verificationUrl: string): Promise<void>;
}

/** Sends transactional e-mails through SMTP (Gmail by default). */
export class SmtpMailer implements Mailer {
  private transporter?: Transporter;

  private getTransporter(): Transporter {
    this.transporter ??= nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return this.transporter;
  }

  async sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    await this.getTransporter().sendMail({
      from: 'PRO-EDU-4-U',
      to,
      subject: 'Confirm your email',
      html: generateHtmlTemplate('templates/register-confirm.html', [
        { key: 'verificationUrl', value: verificationUrl },
      ]),
    });
  }
}

export const mailer = new SmtpMailer();
