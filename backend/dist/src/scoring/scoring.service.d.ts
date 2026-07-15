import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class ScoringService {
    private prisma;
    private scoringQueue;
    constructor(prisma: PrismaService, scoringQueue: Queue);
    private runWithTimeout;
    scoreProperty(seekerProfileId: string, propertyId: string): Promise<{
        status: string;
        score: {
            id: string;
            targetType: import("@prisma/client").$Enums.TargetType;
            score: number;
            explanation: string;
            source: import("@prisma/client").$Enums.ScoreSource;
            computedAt: Date;
            seekerProfileId: string;
            targetPropertyId: string | null;
            targetSeekerProfileId: string | null;
        };
        jobId?: undefined;
    } | {
        status: string;
        jobId: string | undefined;
        score?: undefined;
    }>;
    scoreSeeker(seekerProfileId: string, targetSeekerProfileId: string): Promise<{
        status: string;
        score: {
            id: string;
            targetType: import("@prisma/client").$Enums.TargetType;
            score: number;
            explanation: string;
            source: import("@prisma/client").$Enums.ScoreSource;
            computedAt: Date;
            seekerProfileId: string;
            targetPropertyId: string | null;
            targetSeekerProfileId: string | null;
        };
        jobId?: undefined;
    } | {
        status: string;
        jobId: string | undefined;
        score?: undefined;
    }>;
    getScore(id: string): Promise<{
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
    getPropertyScore(seekerProfileId: string, propertyId: string): Promise<{
        id: string;
        targetType: import("@prisma/client").$Enums.TargetType;
        score: number;
        explanation: string;
        source: import("@prisma/client").$Enums.ScoreSource;
        computedAt: Date;
        seekerProfileId: string;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
    } | null>;
}
