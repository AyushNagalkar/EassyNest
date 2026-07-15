import { ConfigService } from '@nestjs/config';
export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private resend;
    private transporter;
    private from;
    constructor(configService: ConfigService);
    sendEmail(payload: EmailPayload): Promise<void>;
    interestReceivedEmail(ownerName: string, tenantName: string, property: any, score: number): EmailPayload;
    interestAcceptedEmail(tenantName: string, property: any, interestId: string): EmailPayload;
    interestDeclinedEmail(tenantName: string, property: any): EmailPayload;
    newMatchAlertEmail(userName: string, searchName: string, matchCount: number): EmailPayload;
}
