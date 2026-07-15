declare const _default: () => {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    database: {
        url: string | undefined;
        directUrl: string | undefined;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    gemini: {
        apiKey: string;
        model: string;
        timeoutMs: number;
        maxRetries: number;
    };
    redis: {
        url: string;
    };
    supabase: {
        url: string;
        serviceRoleKey: string;
        storageBucket: string;
    };
    email: {
        resendApiKey: string;
        smtpHost: string;
        smtpPort: number;
        smtpUser: string;
        smtpPass: string;
        from: string;
    };
};
export default _default;
