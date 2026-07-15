import { PrismaService } from '../prisma/prisma.service.js';
import { MessageType } from '@prisma/client';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getMessages(interestId: string, userId: string, page?: number, limit?: number): Promise<{
        data: ({
            sender: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.MessageType;
            readAt: Date | null;
            chatRoomId: string;
            senderId: string;
            content: string;
            imageUrl: string | null;
        })[];
        chatRoomId: string;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createMessage(chatRoomId: string, senderId: string, content: string, type?: MessageType, imageUrl?: string): Promise<{
        sender: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.MessageType;
        readAt: Date | null;
        chatRoomId: string;
        senderId: string;
        content: string;
        imageUrl: string | null;
    }>;
    markAsRead(chatRoomId: string, userId: string): Promise<{
        markedCount: number;
        readAt: Date;
    }>;
    getUnreadCounts(userId: string): Promise<{
        chatRoomId: string;
        interestId: string;
        unreadCount: number;
    }[]>;
    validateChatRoomMembership(chatRoomId: string, userId: string): Promise<boolean>;
    private validateMembership;
    private isMember;
}
