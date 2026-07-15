"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    resend = null;
    transporter = null;
    from;
    constructor(configService) {
        this.configService = configService;
        this.from = this.configService.get('email.from') || 'EassyNest <noreply@eessynest.com>';
        const smtpHost = this.configService.get('email.smtpHost');
        const smtpPort = this.configService.get('email.smtpPort') || 587;
        const smtpUser = this.configService.get('email.smtpUser');
        const smtpPass = this.configService.get('email.smtpPass');
        const resendApiKey = this.configService.get('email.resendApiKey');
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
        }
        else if (resendApiKey && resendApiKey !== 'your-resend-key') {
            this.logger.log('Resend email service configured');
            this.resend = new resend_1.Resend(resendApiKey);
        }
        else {
            this.logger.warn('No email service configured — emails will be logged only');
        }
    }
    async sendEmail(payload) {
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
            }
            catch (error) {
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
            }
            catch (error) {
                this.logger.error(`Failed to send email via Resend to ${payload.to}:`, error);
            }
            return;
        }
        this.logger.log(`[DEV MODE] Email body:\n${payload.html}`);
    }
    interestReceivedEmail(ownerName, tenantName, propertyTitle, score) {
        return {
            to: '',
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
    interestAcceptedEmail(tenantName, propertyTitle, interestId) {
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
    interestDeclinedEmail(tenantName, propertyTitle) {
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
    newMatchAlertEmail(userName, searchName, matchCount) {
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map