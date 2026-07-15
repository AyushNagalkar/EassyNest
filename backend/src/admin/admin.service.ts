import { Injectable } from '@nestjs/common';
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
}
