import { ChatService } from './chat.service.js';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getUnreadCounts(userId: string): Promise<{
        chatRoomId: string;
        interestId: string;
        unreadCount: number;
    }[]>;
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
}
