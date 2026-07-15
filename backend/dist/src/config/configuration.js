"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    database: {
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || '8000', 10),
        maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '2', 10),
    },
    redis: {
        url: process.env.UPSTASH_REDIS_URL || '',
    },
    supabase: {
        url: process.env.SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'listing-photos',
    },
    email: {
        resendApiKey: process.env.RESEND_API_KEY || '',
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'EassyNest <noreply@eessynest.com>',
    },
});
//# sourceMappingURL=configuration.js.map