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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [userCount, ownerCount, tenantCount, propertyCount, activePropertyCount, interestCount, acceptedInterests, scoreCount, messageCount] = await Promise.all([
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
    async getUsers(page = 1, limit = 20, role, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
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
    async deactivateUser(userId, adminId) {
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
    async reactivateUser(userId, adminId) {
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
    async getProperties(page = 1, limit = 20, status, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
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
    async forceRemoveProperty(propertyId, adminId) {
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
    async getFlags(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
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
    async reviewFlag(flagId, adminId, action) {
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
            .map((u) => `${u.id},${u.email},"${u.name}",${u.role},${u.isActive},${u.emailVerified},${u.createdAt.toISOString()}`)
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
            .map((p) => `${p.id},"${p.title}",${p.city},${p.rent},${p.roomType},${p.status},${p.viewCount},${p.interestCount},"${p.owner.name}",${p.owner.email},${p.createdAt.toISOString()}`)
            .join('\n');
        return header + rows;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map