import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private configService: ConfigService) {
    this.from = this.configService.get<string>('email.from') || 'EassyNest <noreply@eessynest.com>';

    const smtpHost = this.configService.get<string>('email.smtpHost');
    const smtpPort = this.configService.get<number>('email.smtpPort') || 587;
    const smtpUser = this.configService.get<string>('email.smtpUser');
    const smtpPass = this.configService.get<string>('email.smtpPass');

    const resendApiKey = this.configService.get<string>('email.resendApiKey');

    if (smtpHost && smtpUser && smtpPass) {
      this.logger.log(`SMTP configured: host=${smtpHost}, port=${smtpPort}, user=${smtpUser}`);
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else if (resendApiKey && resendApiKey !== 'your-resend-key') {
      this.logger.log('Resend email service configured');
      this.resend = new Resend(resendApiKey);
    } else {
      this.logger.warn('No email service configured — emails will be logged only');
    }
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    this.logger.log(`📧 Sending email to ${payload.to}: ${payload.subject}`);

    if (this.transporter) {
      try {
        const mailOptions = {
          from: this.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        };
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email successfully sent via SMTP to ${payload.to}`);
      } catch (error) {
        this.logger.error(`Failed to send email via SMTP to ${payload.to}:`, error);
      }
      return;
    }

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
        this.logger.log(`Email successfully sent via Resend to ${payload.to}`);
      } catch (error) {
        this.logger.error(`Failed to send email via Resend to ${payload.to}:`, error);
      }
      return;
    }

    this.logger.log(`[DEV MODE] Email body:\n${payload.html}`);
  }

  // ---------- Email templates ----------

  interestReceivedEmail(ownerName: string, tenantName: string, propertyTitle: string, score: number): EmailPayload {
    return {
      to: '', // filled by caller
      subject: `New interest in "${propertyTitle}" — ${score}% match!`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4F46E5;">New Interest Received! 🎉</h2>
          <p>Hi ${ownerName},</p>
          <p><strong>${tenantName}</strong> has expressed interest in your listing <strong>"${propertyTitle}"</strong>.</p>
          <div style="background: ${score >= 80 ? '#DCFCE7' : score >= 50 ? '#FEF3C7' : '#F3F4F6'}; 
                      border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0;">
            <p style="font-size: 14px; color: #6B7280; margin: 0;">Compatibility Score</p>
            <p style="font-size: 36px; font-weight: 700; color: ${score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#64748B'}; margin: 4px 0;">${score}%</p>
          </div>
          <p>Log in to review the interest and respond.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/interests" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Interest
          </a>
        </div>
      `,
    };
  }

  interestAcceptedEmail(tenantName: string, propertyTitle: string, interestId: string): EmailPayload {
    return {
      to: '',
      subject: `Your interest in "${propertyTitle}" was accepted! 🎉`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #16A34A;">Interest Accepted! ✅</h2>
          <p>Hi ${tenantName},</p>
          <p>Great news! Your interest in <strong>"${propertyTitle}"</strong> has been accepted.</p>
          <p>You can now chat directly with the property owner.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/chat/${interestId}" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Start Chatting
          </a>
        </div>
      `,
    };
  }

  interestDeclinedEmail(tenantName: string, propertyTitle: string): EmailPayload {
    return {
      to: '',
      subject: `Update on your interest in "${propertyTitle}"`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #64748B;">Interest Update</h2>
          <p>Hi ${tenantName},</p>
          <p>Unfortunately, your interest in <strong>"${propertyTitle}"</strong> was not accepted at this time.</p>
          <p>Don't worry — there are plenty of other great listings to explore!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/properties" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Browse Properties
          </a>
        </div>
      `,
    };
  }

  newMatchAlertEmail(userName: string, searchName: string, matchCount: number): EmailPayload {
    return {
      to: '',
      subject: `${matchCount} new listing${matchCount > 1 ? 's' : ''} match your saved search "${searchName}"`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4F46E5;">New Matches Found! 🔍</h2>
          <p>Hi ${userName},</p>
          <p>We found <strong>${matchCount} new listing${matchCount > 1 ? 's' : ''}</strong> matching your saved search <strong>"${searchName}"</strong>.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/properties" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Matches
          </a>
        </div>
      `,
    };
  }
}
