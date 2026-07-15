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

  interestReceivedEmail(ownerName: string, tenantName: string, property: any, score: number): EmailPayload {
    const formattedRent = property.rent ? `₹${property.rent.toLocaleString('en-IN')}` : 'N/A';
    const formattedDeposit = property.deposit ? `₹${property.deposit.toLocaleString('en-IN')}` : 'N/A';
    
    return {
      to: '',
      subject: `🔥 New Tenant Interest in "${property.title}" — ${score}% Match!`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F9FAFB; padding: 32px 16px; color: #1F2937;">
          <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <!-- Gradient Header -->
            <div style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">New Tenant Interest! 🎉</h1>
              <p style="color: #E0E7FF; margin: 8px 0 0 0; font-size: 15px;">A highly compatible tenant is eager to connect.</p>
            </div>
            
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${ownerName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! <strong>${tenantName}</strong> has expressed interest in renting your property, and they look like an exceptional fit.
              </p>
              
              <!-- Compatibility Badge -->
              <div style="background: ${score >= 80 ? '#ECFDF5' : '#FFFBEB'}; border: 1px solid ${score >= 80 ? '#A7F3D0' : '#FDE68A'}; border-radius: 16px; padding: 20px; text-align: center; margin: 0 0 28px 0;">
                <p style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${score >= 80 ? '#065F46' : '#92400E'}; margin: 0 0 6px 0;">AI Match Score</p>
                <div style="font-size: 42px; font-weight: 800; color: ${score >= 80 ? '#059669' : '#D97706'};">${score}%</div>
                <p style="font-size: 14px; color: #4B5563; margin: 8px 0 0 0; font-style: italic;">
                  Based on shared preferences, sleep schedules, smoker/pet rules, and lifestyle match.
                </p>
              </div>

              <!-- Property Summary Card -->
              <div style="border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; background-color: #F9FAFB; margin: 0 0 28px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #111827; font-weight: 700;">Property Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280; width: 110px;"><strong>Title:</strong></td>
                    <td style="padding: 6px 0; color: #111827;">${property.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Rent:</strong></td>
                    <td style="padding: 6px 0; color: #4F46E5; font-weight: 700;">${formattedRent} / month</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Deposit:</strong></td>
                    <td style="padding: 6px 0; color: #111827;">${formattedDeposit}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Room Type:</strong></td>
                    <td style="padding: 6px 0; color: #111827; text-transform: capitalize;">${property.roomType?.replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Furnishing:</strong></td>
                    <td style="padding: 6px 0; color: #111827; text-transform: capitalize;">${property.furnishing?.replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Location:</strong></td>
                    <td style="padding: 6px 0; color: #111827;">${property.address}, ${property.city}</td>
                  </tr>
                </table>
              </div>

              <!-- Button CTA -->
              <div style="text-align: center; margin: 32px 0 12px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://eassy-nest.vercel.app'}/interests" 
                   style="display: inline-block; background: #4F46E5; color: #FFFFFF; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                  View Interest Profile
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
              &copy; 2026 EassyNest. Helping you find the perfect nest.
            </div>
          </div>
        </div>
      `,
    };
  }

  interestAcceptedEmail(tenantName: string, property: any, interestId: string): EmailPayload {
    const ownerName = property.owner?.name || 'The Owner';
    const formattedRent = property.rent ? `₹${property.rent.toLocaleString('en-IN')}` : 'N/A';
    
    return {
      to: '',
      subject: `🎉 Hurray! Your Interest in "${property.title}" was ACCEPTED!`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F9FAFB; padding: 32px 16px; color: #1F2937;">
          <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <!-- Gradient Header (Success Green) -->
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Congratulations! 🏠</h1>
              <p style="color: #D1FAE5; margin: 8px 0 0 0; font-size: 15px;">Your application has been approved by the owner.</p>
            </div>
            
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${tenantName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Fantastic news! <strong>${ownerName}</strong> has accepted your interest expression in their listing <strong>"${property.title}"</strong>.
              </p>

              <!-- Property Summary Card -->
              <div style="border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; background-color: #F9FAFB; margin: 0 0 28px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #111827; font-weight: 700;">Property & Owner Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280; width: 110px;"><strong>Owner Name:</strong></td>
                    <td style="padding: 6px 0; color: #111827; font-weight: 600;">${ownerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Rent:</strong></td>
                    <td style="padding: 6px 0; color: #059669; font-weight: 700;">${formattedRent} / month</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Room Type:</strong></td>
                    <td style="padding: 6px 0; color: #111827; text-transform: capitalize;">${property.roomType?.replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6B7280;"><strong>Location:</strong></td>
                    <td style="padding: 6px 0; color: #111827;">${property.address}, ${property.city}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; text-align: center; color: #4B5563;">
                You can now connect directly via chat to discuss moving dates, guidelines, or agreements!
              </p>

              <!-- Button CTA -->
              <div style="text-align: center; margin: 32px 0 12px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://eassy-nest.vercel.app'}/chat/${interestId}" 
                   style="display: inline-block; background: #10B981; color: #FFFFFF; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
                  Start Chatting Now
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
              &copy; 2026 EassyNest. Helping you find the perfect nest.
            </div>
          </div>
        </div>
      `,
    };
  }

  interestDeclinedEmail(tenantName: string, property: any): EmailPayload {
    return {
      to: '',
      subject: `Update on your interest in "${property.title}"`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F9FAFB; padding: 32px 16px; color: #1F2937;">
          <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <div style="background: #64748B; padding: 28px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">Nest Search Update</h1>
            </div>
            
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${tenantName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for applying to <strong>"${property.title}"</strong>. Unfortunately, the owner has declined your interest expression at this time.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 28px 0;">
                Please don't be discouraged! There are hundreds of other incredible listings matching your preferences on EassyNest.
              </p>

              <!-- Button CTA -->
              <div style="text-align: center; margin: 32px 0 12px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://eassy-nest.vercel.app'}/properties" 
                   style="display: inline-block; background: #4F46E5; color: #FFFFFF; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  Explore More Properties
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
              &copy; 2026 EassyNest. Helping you find the perfect nest.
            </div>
          </div>
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
