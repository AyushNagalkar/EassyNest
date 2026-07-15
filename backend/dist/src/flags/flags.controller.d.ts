import { FlagReason } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
declare class CreateFlagDto {
    targetType: string;
    targetId: string;
    reason: FlagReason;
    details?: string;
    propertyId?: string;
}
export declare class FlagsController {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateFlagDto): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FlagStatus;
        targetType: string;
        targetId: string;
        propertyId: string | null;
        creatorId: string;
        reason: import("@prisma/client").$Enums.FlagReason;
        details: string | null;
        reviewedAt: Date | null;
    }>;
}
export {};
