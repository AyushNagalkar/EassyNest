import { ScoringService } from './scoring.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class ScoringController {
    private scoringService;
    private prisma;
    constructor(scoringService: ScoringService, prisma: PrismaService);
    scoreProperty(userId: string, propertyId: string): Promise<{
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
    scoreSeeker(userId: string, seekerProfileId: string): Promise<{
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
}
