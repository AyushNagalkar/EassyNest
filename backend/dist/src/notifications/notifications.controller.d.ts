import { NotificationsService } from './notifications.service.js';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
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
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
    markRead(id: string, userId: string): Promise<{
        message: string;
    }>;
}
