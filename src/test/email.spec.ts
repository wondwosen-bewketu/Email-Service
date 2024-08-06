import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import * as Handlebars from 'handlebars';
import { CronJob } from 'cron'; // If you are using `cron` for scheduling

describe('EmailService', () => {
  let emailService: EmailService;
  let transporter: Transporter;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        ConfigService,
        {
          provide: 'MAILER_TRANSPORT',
          useValue: createTransport({
            host: process.env.SMTP_HOST,
            port: +process.env.SMTP_PORT,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          }),
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    transporter = module.get('MAILER_TRANSPORT');
  });

  describe('sendEmail', () => {
    it('should send a single email', async () => {
      const emailOptions = {
        to: 'test-recipient@example.com',
        subject: 'Test Single Email',
        templateName: 'welcome-email',
        context: { name: 'John Doe' },
      };

      const sendMailSpy = jest
        .spyOn(transporter, 'sendMail')
        .mockResolvedValue({} as any);

      await expect(emailService.sendEmail(emailOptions)).resolves.not.toThrow();
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test-recipient@example.com',
          subject: 'Test Single Email',
        }),
      );
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk emails', async () => {
      const emailOptions = {
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Bulk Email',
        templateName: 'newsletter',
        context: { companyName: 'Our Company' },
      };

      const sendMailSpy = jest
        .spyOn(transporter, 'sendMail')
        .mockResolvedValue({} as any);

      await expect(
        emailService.sendBulkEmail(emailOptions),
      ).resolves.not.toThrow();
      expect(sendMailSpy).toHaveBeenCalledTimes(2); // Expecting 2 emails to be sent
    });
  });

  describe('scheduleEmail', () => {
    it('should schedule an email', async () => {
      const emailOptions = {
        to: 'test-recipient@example.com',
        subject: 'Test Scheduled Email',
        templateName: 'example-template',
        context: { eventName: 'Annual Meeting' },
      };

      // Mocking the cron job to ensure the scheduling logic is tested
      const scheduleEmailSpy = jest
        .spyOn(emailService, 'scheduleEmail')
        .mockImplementation((options, cronTime) => {
          // Simulate cron job scheduling
          new CronJob(cronTime, async () => {
            await emailService.sendEmail(options);
          }).start();
          return Promise.resolve();
        });

      await expect(
        emailService.scheduleEmail(emailOptions, '0 9 * * *'),
      ).resolves.not.toThrow();
      expect(scheduleEmailSpy).toHaveBeenCalledWith(emailOptions, '0 9 * * *');
    });
  });

  afterAll(async () => {
    await transporter.close();
  });
});
