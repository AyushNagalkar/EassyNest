import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [userCount, ownerCount, tenantCount, propertyCount, activePropertyCount,
           interestCount, acceptedInterests, scoreCount, messageCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'OWNER' } }),
      this.prisma.user.count({ where: { role: 'TENANT' } }),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.interest.count(),
      this.prisma.interest.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.compatibilityScore.count(),
      this.prisma.message.count(),
    ]);

    // Recent signups (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignups = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    });

    return {
      users: { total: userCount, owners: ownerCount, tenants: tenantCount },
      properties: { total: propertyCount, active: activePropertyCount },
      interests: { total: interestCount, accepted: acceptedInterests },
      scores: scoreCount,
      messages: messageCount,
      recentSignups: recentSignups.length,
    };
  }

  async getUsers(page = 1, limit = 20, role?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role as any;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { properties: true, sentInterests: true, messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async deactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isActive: true },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        actorId: adminId,
        action: 'DEACTIVATE_USER',
        targetType: 'USER',
        targetId: userId,
      },
    });

    return user;
  }

  async reactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: { id: true, email: true, name: true, isActive: true },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        actorId: adminId,
        action: 'REACTIVATE_USER',
        targetType: 'USER',
        targetId: userId,
      },
    });

    return user;
  }

  async getProperties(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.PropertyWhereInput = {};

    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          photos: { take: 1, orderBy: { order: 'asc' } },
          _count: { select: { interests: true, favorites: true, flags: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async forceRemoveProperty(propertyId: string, adminId: string) {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'INACTIVE' },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        actorId: adminId,
        action: 'FORCE_REMOVE_PROPERTY',
        targetType: 'PROPERTY',
        targetId: propertyId,
      },
    });

    return { message: 'Property removed' };
  }

  async getActivity(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.adminActivityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminActivityLog.count(),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFlags(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.FlagWhereInput = {};
    if (status) where.status = status as any;

    const [flags, total] = await Promise.all([
      this.prisma.flag.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.flag.count({ where }),
    ]);

    return {
      data: flags,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async reviewFlag(flagId: string, adminId: string, action: 'DISMISSED' | 'ACTIONED') {
    const flag = await this.prisma.flag.update({
      where: { id: flagId },
      data: { status: action, reviewedAt: new Date() },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        actorId: adminId,
        action: `FLAG_${action}`,
        targetType: 'FLAG',
        targetId: flagId,
      },
    });

    return flag;
  }

  async exportUsersCsv() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'id,email,name,role,isActive,emailVerified,createdAt\n';
    const rows = users
      .map(
        (u) =>
          `${u.id},${u.email},"${u.name}",${u.role},${u.isActive},${u.emailVerified},${u.createdAt.toISOString()}`,
      )
      .join('\n');

    return header + rows;
  }

  async exportListingsCsv() {
    const properties = await this.prisma.property.findMany({
      select: {
        id: true,
        title: true,
        city: true,
        rent: true,
        roomType: true,
        status: true,
        viewCount: true,
        interestCount: true,
        createdAt: true,
        owner: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'id,title,city,rent,roomType,status,viewCount,interestCount,ownerName,ownerEmail,createdAt\n';
    const rows = properties
      .map(
        (p) =>
          `${p.id},"${p.title}",${p.city},${p.rent},${p.roomType},${p.status},${p.viewCount},${p.interestCount},"${p.owner.name}",${p.owner.email},${p.createdAt.toISOString()}`,
      )
      .join('\n');

    return header + rows;
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      // 1. Delete reviews
      await tx.review.deleteMany({
        where: { OR: [{ authorId: userId }, { targetId: userId }] },
      });

      // 2. Delete flags
      await tx.flag.deleteMany({
        where: { creatorId: userId },
      });

      // 3. Delete favorites
      await tx.favorite.deleteMany({
        where: { userId },
      });

      // 4. Delete notifications
      await tx.notification.deleteMany({
        where: { userId },
      });

      // 5. Delete saved searches
      await tx.savedSearch.deleteMany({
        where: { userId },
      });

      // 6. Delete seeker profile & its related scores/interests
      const seekerProfile = await tx.seekerProfile.findUnique({
        where: { userId },
      });
      if (seekerProfile) {
        await tx.compatibilityScore.deleteMany({
          where: {
            OR: [
              { seekerProfileId: seekerProfile.id },
              { targetSeekerProfileId: seekerProfile.id },
            ],
          },
        });

        const targetInterests = await tx.interest.findMany({
          where: { targetType: 'SEEKER_PROFILE', targetSeekerProfileId: seekerProfile.id },
          select: { id: true },
        });
        const targetInterestIds = targetInterests.map((i) => i.id);

        if (targetInterestIds.length > 0) {
          await tx.message.deleteMany({
            where: { chatRoom: { interestId: { in: targetInterestIds } } },
          });
          await tx.chatRoom.deleteMany({
            where: { interestId: { in: targetInterestIds } },
          });
          await tx.interest.deleteMany({
            where: { id: { in: targetInterestIds } },
          });
        }

        await tx.seekerProfile.delete({
          where: { id: seekerProfile.id },
        });
      }

      // 7. Delete owned properties & their related photos/scores/interests/views/flags/favorites
      const properties = await tx.property.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      const propertyIds = properties.map((p) => p.id);

      if (propertyIds.length > 0) {
        await tx.propertyPhoto.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });
        await tx.compatibilityScore.deleteMany({
          where: { targetType: 'PROPERTY', targetPropertyId: { in: propertyIds } },
        });
        await tx.propertyView.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });
        await tx.favorite.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });
        await tx.flag.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });

        const propertyInterests = await tx.interest.findMany({
          where: { targetType: 'PROPERTY', targetPropertyId: { in: propertyIds } },
          select: { id: true },
        });
        const propInterestIds = propertyInterests.map((i) => i.id);

        if (propInterestIds.length > 0) {
          await tx.message.deleteMany({
            where: { chatRoom: { interestId: { in: propInterestIds } } },
          });
          await tx.chatRoom.deleteMany({
            where: { interestId: { in: propInterestIds } },
          });
          await tx.interest.deleteMany({
            where: { id: { in: propInterestIds } },
          });
        }

        await tx.property.deleteMany({
          where: { id: { in: propertyIds } },
        });
      }

      // 8. Delete sent interests
      const sentInterests = await tx.interest.findMany({
        where: { fromUserId: userId },
        select: { id: true },
      });
      const sentInterestIds = sentInterests.map((i) => i.id);

      if (sentInterestIds.length > 0) {
        await tx.message.deleteMany({
          where: { chatRoom: { interestId: { in: sentInterestIds } } },
        });
        await tx.chatRoom.deleteMany({
          where: { interestId: { in: sentInterestIds } },
        });
        await tx.interest.deleteMany({
          where: { id: { in: sentInterestIds } },
        });
      }

      // 9. Delete messages sent by user
      await tx.message.deleteMany({
        where: { senderId: userId },
      });

      // 10. Delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Log admin action
    await this.prisma.adminActivityLog.create({
      data: {
        actorId: adminId,
        action: 'DELETE_USER',
        targetType: 'USER',
        targetId: userId,
      },
    });

    return { message: 'User and all associated data permanently deleted' };
  }
}
