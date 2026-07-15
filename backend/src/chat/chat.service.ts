import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get paginated message history for a chat room.
   */
  async getMessages(interestId: string, userId: string, page = 1, limit = 50) {
    const interest = await this.prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        chatRoom: true,
        targetProperty: { select: { ownerId: true } },
        targetSeekerProfile: { select: { userId: true } },
      },
    });

    if (!interest) throw new NotFoundException('Interest not found');
    if (!interest.chatRoom) throw new NotFoundException('Chat room not found — interest must be accepted first');

    // Validate membership
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
      data: messages.reverse(), // reverse to show oldest first
      chatRoomId: interest.chatRoom.id,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Persist a message to the database.
   */
  async createMessage(
    chatRoomId: string,
    senderId: string,
    content: string,
    type: MessageType = 'TEXT',
    imageUrl?: string,
  ) {
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

  /**
   * Mark messages as read.
   */
  async markAsRead(chatRoomId: string, userId: string) {
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

  /**
   * Get unread message counts per chat room for a user.
   */
  async getUnreadCounts(userId: string) {
    // Get all chat rooms the user is a participant in
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

    const counts: { chatRoomId: string; interestId: string; unreadCount: number }[] = [];

    for (const interest of interests) {
      if (!interest.chatRoom) continue;
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

  /**
   * Validate that a user is a member of the chat room's interest.
   */
  async validateChatRoomMembership(chatRoomId: string, userId: string): Promise<boolean> {
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

    if (!chatRoom) return false;
    return this.isMember(chatRoom.interest, userId);
  }

  private validateMembership(interest: any, userId: string) {
    if (!this.isMember(interest, userId)) {
      throw new ForbiddenException('You are not a participant in this chat');
    }
  }

  private isMember(interest: any, userId: string): boolean {
    if (interest.fromUserId === userId) return true;
    if (interest.targetProperty?.ownerId === userId) return true;
    if (interest.targetSeekerProfile?.userId === userId) return true;
    return false;
  }
}
