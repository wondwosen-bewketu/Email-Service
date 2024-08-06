import { Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailOptions, EmailContext } from '../interfaces/email.interfaces';
import { compileTemplate } from '../utils/email.utils';
import { LoggerService } from '../logger/logger.service';
import { EMAIL_TEMPLATES } from '../constants/email.constants';
import { CronJob } from 'cron';

@Injectable()
export class EmailService {
  private transporter;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.transporter = createTransport({
      host: this.configService.get<string>('email.smtpHost'),
      port: this.configService.get<number>('email.smtpPort'),
      auth: {
        user: this.configService.get<string>('email.smtpUser'),
        pass: this.configService.get<string>('email.smtpPass'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, templateName, context } = options;
    const html = compileTemplate(templateName, context);
    const mailOptions: SendMailOptions = {
      from: this.configService.get<string>('email.fromEmail'),
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to} with subject ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}. Error: ${error.message}`);
      throw new Error(`Failed to send email to ${to}.`);
    }
  }

  async sendBulkEmail(options: EmailOptions): Promise<void> {
    const { to, subject, templateName, context } = options;
    const html = compileTemplate(templateName, context);

    try {
      await Promise.all(
        (to instanceof Array ? to : [to]).map(email =>
          this.transporter.sendMail({
            from: this.configService.get<string>('email.fromEmail'),
            to: email,
            subject,
            html,
          })
        )
      );
      this.logger.log(`Bulk emails sent with subject ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send bulk emails with subject ${subject}. Error: ${error.message}`);
      throw new Error(`Failed to send bulk emails with subject ${subject}.`);
    }
  }

  scheduleEmail(options: EmailOptions, cronTime: string): void {
    new CronJob(cronTime, async () => {
      await this.sendEmail(options);
    }).start();
    this.logger.log(`Scheduled email with subject ${options.subject} at ${cronTime}`);
  }
}
