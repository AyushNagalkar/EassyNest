import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userName?: string;
}
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    private notificationsService;
    private jwtService;
    private configService;
    private prisma;
    server: Server;
    private readonly logger;
    private onlineUsers;
    constructor(chatService: ChatService, notificationsService: NotificationsService, jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    afterInit(): void;
    handleConnection(socket: AuthenticatedSocket): Promise<void>;
    handleDisconnect(socket: AuthenticatedSocket): void;
    handleJoinRoom(socket: AuthenticatedSocket, data: {
        chatRoomId: string;
    }): Promise<void>;
    handleLeaveRoom(socket: AuthenticatedSocket, data: {
        chatRoomId: string;
    }): void;
    handleMessage(socket: AuthenticatedSocket, data: {
        chatRoomId: string;
        content: string;
        type?: 'TEXT' | 'IMAGE';
        imageUrl?: string;
    }): Promise<void>;
    handleTyping(socket: AuthenticatedSocket, data: {
        chatRoomId: string;
        isTyping: boolean;
    }): void;
    handleReadReceipt(socket: AuthenticatedSocket, data: {
        chatRoomId: string;
    }): Promise<void>;
    handlePresenceCheck(socket: AuthenticatedSocket, data: {
        userIds: string[];
    }): void;
    private getOtherParticipants;
}
export {};
