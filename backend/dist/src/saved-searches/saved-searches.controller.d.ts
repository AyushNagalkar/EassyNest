import { PrismaService } from '../prisma/prisma.service.js';
declare class CreateSavedSearchDto {
    name: string;
    filters: any;
    alertsOn?: boolean;
}
export declare class SavedSearchesController {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateSavedSearchDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        alertsOn: boolean;
        filters: import("@prisma/client/runtime/library").JsonValue;
        lastAlertAt: Date | null;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        alertsOn: boolean;
        filters: import("@prisma/client/runtime/library").JsonValue;
        lastAlertAt: Date | null;
    }[]>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
export {};
