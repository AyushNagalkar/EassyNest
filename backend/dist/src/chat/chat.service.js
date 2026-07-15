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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMessages(interestId, userId, page = 1, limit = 50) {
        const interest = await this.prisma.interest.findUnique({
            where: { id: interestId },
            include: {
                chatRoom: true,
                targetProperty: { select: { ownerId: true } },
                targetSeekerProfile: { select: { userId: true } },
            },
        });
        if (!interest)
            throw new common_1.NotFoundException('Interest not found');
        if (!interest.chatRoom)
            throw new common_1.NotFoundException('Chat room not found — interest must be accepted first');
        this.validateMembership(interest, userId);
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { chatRoomId: interest.chatRoom.id },
                include: {
                    sender: { select: { id: true, name: true, avatarUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.message.count({ where: { chatRoomId: interest.chatRoom.id } }),
        ]);
        return {
            data: messages.reverse(),
            chatRoomId: interest.chatRoom.id,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async createMessage(chatRoomId, senderId, content, type = 'TEXT', imageUrl) {
        return this.prisma.message.create({
            data: {
                chatRoomId,
                senderId,
                content,
                type,
                imageUrl,
            },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
    }
    async markAsRead(chatRoomId, userId) {
        const now = new Date();
        const result = await this.prisma.message.updateMany({
            where: {
                chatRoomId,
                senderId: { not: userId },
                readAt: null,
            },
            data: { readAt: now },
        });
        return { markedCount: result.count, readAt: now };
    }
    async getUnreadCounts(userId) {
        const interests = await this.prisma.interest.findMany({
            where: {
                OR: [
                    { fromUserId: userId, status: 'ACCEPTED' },
                    {
                        status: 'ACCEPTED',
                        targetProperty: { ownerId: userId },
                    },
                    {
                        status: 'ACCEPTED',
                        targetSeekerProfile: { userId },
                    },
                ],
            },
            include: { chatRoom: true },
        });
        const counts = [];
        for (const interest of interests) {
            if (!interest.chatRoom)
                continue;
            const unreadCount = await this.prisma.message.count({
                where: {
                    chatRoomId: interest.chatRoom.id,
                    senderId: { not: userId },
                    readAt: null,
                },
            });
            counts.push({
                chatRoomId: interest.chatRoom.id,
                interestId: interest.id,
                unreadCount,
            });
        }
        return counts;
    }
    async validateChatRoomMembership(chatRoomId, userId) {
        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomId },
            include: {
                interest: {
                    include: {
                        targetProperty: { select: { ownerId: true } },
                        targetSeekerProfile: { select: { userId: true } },
                    },
                },
            },
        });
        if (!chatRoom)
            return false;
        return this.isMember(chatRoom.interest, userId);
    }
    validateMembership(interest, userId) {
        if (!this.isMember(interest, userId)) {
            throw new common_1.ForbiddenException('You are not a participant in this chat');
        }
    }
    isMember(interest, userId) {
        if (interest.fromUserId === userId)
            return true;
        if (interest.targetProperty?.ownerId === userId)
            return true;
        if (interest.targetSeekerProfile?.userId === userId)
            return true;
        return false;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map