import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  // Will be set by the chat gateway to push real-time notifications
  private pushHandler: ((userId: string, notification: any) => void) | null = null;

  constructor(private prisma: PrismaService) {}

  setPushHandler(handler: (userId: string, notification: any) => void) {
    this.pushHandler = handler;
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    meta?: any,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, body, meta },
    });

    // Push real-time notification via socket
    if (this.pushHandler) {
      this.pushHandler(userId, notification);
    }

    return notification;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }
}
