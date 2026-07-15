"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const chat_service_js_1 = require("./chat.service.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    notificationsService;
    jwtService;
    configService;
    prisma;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    onlineUsers = new Map();
    constructor(chatService, notificationsService, jwtService, configService, prisma) {
        this.chatService = chatService;
        this.notificationsService = notificationsService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    afterInit() {
        this.notificationsService.setPushHandler((userId, notification) => {
            this.server.to(`user:${userId}`).emit('notification:new', notification);
        });
        this.logger.log('WebSocket Gateway initialized');
    }
    async handleConnection(socket) {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn('Socket connection without token');
                socket.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.accessSecret'),
            });
            socket.userId = payload.sub;
            socket.userName = payload.email;
            socket.join(`user:${payload.sub}`);
            if (!this.onlineUsers.has(payload.sub)) {
                this.onlineUsers.set(payload.sub, new Set());
            }
            this.onlineUsers.get(payload.sub).add(socket.id);
            this.server.emit('presence:update', {
                userId: payload.sub,
                status: 'online',
            });
            this.prisma.user
                .update({
                where: { id: payload.sub },
                data: { lastSeenAt: new Date() },
            })
                .catch(() => { });
            this.logger.log(`User ${payload.sub} connected (socket: ${socket.id})`);
        }
        catch (error) {
            this.logger.warn(`Socket auth failed: ${error}`);
            socket.disconnect();
        }
    }
    handleDisconnect(socket) {
        if (socket.userId) {
            const sockets = this.onlineUsers.get(socket.userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    this.onlineUsers.delete(socket.userId);
                    this.server.emit('presence:update', {
                        userId: socket.userId,
                        status: 'offline',
                    });
                    this.prisma.user
                        .update({
                        where: { id: socket.userId },
                        data: { lastSeenAt: new Date() },
                    })
                        .catch(() => { });
                }
            }
            this.logger.log(`User ${socket.userId} disconnected (socket: ${socket.id})`);
        }
    }
    async handleJoinRoom(socket, data) {
        if (!socket.userId)
            return;
        const isMember = await this.chatService.validateChatRoomMembership(data.chatRoomId, socket.userId);
        if (!isMember) {
            socket.emit('error', { message: 'Not a participant of this chat' });
            return;
        }
        socket.join(`chat:${data.chatRoomId}`);
        this.logger.log(`User ${socket.userId} joined chat:${data.chatRoomId}`);
        socket.emit('chat:joined', { chatRoomId: data.chatRoomId });
    }
    handleLeaveRoom(socket, data) {
        socket.leave(`chat:${data.chatRoomId}`);
    }
    async handleMessage(socket, data) {
        if (!socket.userId)
            return;
        const isMember = await this.chatService.validateChatRoomMembership(data.chatRoomId, socket.userId);
        if (!isMember) {
            socket.emit('error', { message: 'Not a participant of this chat' });
            return;
        }
        const message = await this.chatService.createMessage(data.chatRoomId, socket.userId, data.content, data.type || 'TEXT', data.imageUrl);
        this.server.to(`chat:${data.chatRoomId}`).emit('chat:message', message);
        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: { id: data.chatRoomId },
            include: {
                interest: {
                    include: {
                        fromUser: { select: { id: true } },
                        targetProperty: { select: { ownerId: true } },
                        targetSeekerProfile: { select: { userId: true } },
                    },
                },
            },
        });
        if (chatRoom) {
            const recipientIds = this.getOtherParticipants(chatRoom.interest, socket.userId);
            for (const recipientId of recipientIds) {
                const recipientSockets = this.onlineUsers.get(recipientId);
                let isInRoom = false;
                if (recipientSockets) {
                    for (const sid of recipientSockets) {
                        try {
                            const s = this.server.sockets?.sockets?.get(sid) ?? this.server.of('/')?.sockets?.get(sid);
                            if (s?.rooms?.has(`chat:${data.chatRoomId}`)) {
                                isInRoom = true;
                                break;
                            }
                        }
                        catch {
                        }
                    }
                }
                if (!isInRoom) {
                    await this.notificationsService.create(recipientId, 'NEW_MESSAGE', 'New Message', `${message.sender.name}: ${data.content.substring(0, 100)}`, { chatRoomId: data.chatRoomId });
                }
            }
        }
    }
    handleTyping(socket, data) {
        if (!socket.userId)
            return;
        socket.to(`chat:${data.chatRoomId}`).emit('chat:typing', {
            userId: socket.userId,
            isTyping: data.isTyping,
        });
    }
    async handleReadReceipt(socket, data) {
        if (!socket.userId)
            return;
        const result = await this.chatService.markAsRead(data.chatRoomId, socket.userId);
        socket.to(`chat:${data.chatRoomId}`).emit('chat:read', {
            chatRoomId: data.chatRoomId,
            userId: socket.userId,
            readAt: result.readAt,
        });
    }
    handlePresenceCheck(socket, data) {
        const statuses = data.userIds.map((userId) => ({
            userId,
            status: this.onlineUsers.has(userId) ? 'online' : 'offline',
        }));
        socket.emit('presence:status', statuses);
    }
    getOtherParticipants(interest, currentUserId) {
        const participants = new Set();
        participants.add(interest.fromUser?.id || interest.fromUserId);
        if (interest.targetProperty?.ownerId)
            participants.add(interest.targetProperty.ownerId);
        if (interest.targetSeekerProfile?.userId)
            participants.add(interest.targetSeekerProfile.userId);
        participants.delete(currentUserId);
        return [...participants];
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleReadReceipt", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('presence:check'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handlePresenceCheck", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [chat_service_js_1.ChatService,
        notifications_service_js_1.NotificationsService,
        jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_js_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map