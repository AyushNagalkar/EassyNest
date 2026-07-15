import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
interface ScoringJobData {
    seekerProfileId: string;
    targetType: 'PROPERTY' | 'SEEKER_PROFILE';
    targetPropertyId?: string;
    targetSeekerProfileId?: string;
}
export declare class ScoringProcessor extends WorkerHost {
    private prisma;
    private configService;
    private readonly logger;
    private geminiApiKey;
    private geminiModel;
    private timeoutMs;
    constructor(prisma: PrismaService, configService: ConfigService);
    process(job: Job<ScoringJobData>): Promise<{
        id: string;
        targetType: import("@prisma/client").$Enums.TargetType;
        score: number;
        explanation: string;
        source: import("@prisma/client").$Enums.ScoreSource;
        computedAt: Date;
        seekerProfileId: string;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
    }>;
    private callGemini;
    private runFallback;
}
export {};
