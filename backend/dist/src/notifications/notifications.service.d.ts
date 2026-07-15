import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    private pushHandler;
    constructor(prisma: PrismaService);
    setPushHandler(handler: (userId: string, notification: any) => void): void;
    create(userId: string, type: NotificationType, title: string, body: string, meta?: any): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: string;
        title: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        body: string;
        read: boolean;
    }>;
    findAll(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.NotificationType;
            userId: string;
            title: string;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            body: string;
            read: boolean;
        }[];
        unreadCount: number;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markRead(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
}
