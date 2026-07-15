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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const client_1 = require("@prisma/client");
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerId, dto) {
        return this.prisma.property.create({
            data: {
                ownerId,
                title: dto.title,
                description: dto.description,
                city: dto.city,
                address: dto.address,
                lat: dto.lat,
                lng: dto.lng,
                rent: dto.rent,
                availableFrom: new Date(dto.availableFrom),
                roomType: dto.roomType,
                furnishing: dto.furnishing,
                amenities: dto.amenities || [],
                rules: dto.rules || [],
                petFriendly: dto.petFriendly ?? false,
                genderPreference: dto.genderPreference ?? 'ANY',
                leaseLengthMonths: dto.leaseLengthMonths,
            },
            include: { photos: true, owner: { select: { id: true, name: true, avatarUrl: true } } },
        });
    }
    async findMine(ownerId) {
        return this.prisma.property.findMany({
            where: { ownerId, status: { not: client_1.ListingStatus.INACTIVE } },
            include: {
                photos: { orderBy: { order: 'asc' } },
                _count: { select: { interests: true, favorites: true, views: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id, viewerIp, viewerId) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                photos: { orderBy: { order: 'asc' } },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        emailVerified: true,
                        createdAt: true,
                        _count: { select: { properties: true } },
                    },
                },
                _count: { select: { interests: true, favorites: true } },
            },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        this.prisma.propertyView
            .create({ data: { propertyId: id, viewerIp, viewerId } })
            .catch(() => { });
        this.prisma.property
            .update({ where: { id }, data: { viewCount: { increment: 1 } } })
            .catch(() => { });
        return property;
    }
    async browse(query, seekerProfileId) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.ListingStatus.ACTIVE,
        };
        if (query.city) {
            where.city = { contains: query.city, mode: 'insensitive' };
        }
        if (query.minRent !== undefined) {
            where.rent = { ...(where.rent || {}), gte: query.minRent };
        }
        if (query.maxRent !== undefined) {
            where.rent = { ...(where.rent || {}), lte: query.maxRent };
        }
        if (query.roomType) {
            const types = query.roomType.split(',');
            where.roomType = { in: types };
        }
        if (query.furnishing) {
            where.furnishing = query.furnishing;
        }
        if (query.amenities) {
            const amenityList = query.amenities.split(',');
            where.amenities = { hasEvery: amenityList };
        }
        if (query.petFriendly !== undefined) {
            where.petFriendly = query.petFriendly;
        }
        if (query.genderPreference) {
            where.genderPreference = { in: [query.genderPreference, 'ANY'] };
        }
        if (query.lat && query.lng && query.radiusKm) {
            const latDelta = query.radiusKm / 111.0;
            const lngDelta = query.radiusKm / (111.0 * Math.cos((query.lat * Math.PI) / 180));
            where.lat = { gte: query.lat - latDelta, lte: query.lat + latDelta };
            where.lng = { gte: query.lng - lngDelta, lte: query.lng + lngDelta };
        }
        let orderBy = { createdAt: 'desc' };
        if (query.sortBy === 'price_asc')
            orderBy = { rent: 'asc' };
        else if (query.sortBy === 'price_desc')
            orderBy = { rent: 'desc' };
        const [properties, total] = await Promise.all([
            this.prisma.property.findMany({
                where,
                include: {
                    photos: { orderBy: { order: 'asc' }, take: 1 },
                    owner: { select: { id: true, name: true, avatarUrl: true } },
                    _count: { select: { favorites: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.property.count({ where }),
        ]);
        let propertiesWithScores = properties.map((p) => ({ ...p, compatibilityScore: null }));
        if (seekerProfileId) {
            const scores = await this.prisma.compatibilityScore.findMany({
                where: {
                    seekerProfileId,
                    targetType: 'PROPERTY',
                    targetPropertyId: { in: properties.map((p) => p.id) },
                },
            });
            const scoreMap = new Map(scores.map((s) => [s.targetPropertyId, s]));
            propertiesWithScores = properties.map((p) => ({
                ...p,
                compatibilityScore: scoreMap.get(p.id) || null,
            }));
            if (query.sortBy === 'score') {
                propertiesWithScores.sort((a, b) => {
                    const scoreA = a.compatibilityScore?.score ?? -1;
                    const scoreB = b.compatibilityScore?.score ?? -1;
                    return scoreB - scoreA;
                });
            }
        }
        let filtered = propertiesWithScores;
        if (query.lat && query.lng && query.radiusKm) {
            filtered = propertiesWithScores.filter((p) => {
                const dist = this.haversine(query.lat, query.lng, p.lat, p.lng);
                return dist <= query.radiusKm;
            });
        }
        return {
            data: filtered,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async update(id, ownerId, dto) {
        const property = await this.prisma.property.findUnique({ where: { id } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.ownerId !== ownerId)
            throw new common_1.ForbiddenException('Not your property');
        const data = { ...dto };
        if (dto.availableFrom)
            data.availableFrom = new Date(dto.availableFrom);
        const updated = await this.prisma.property.update({
            where: { id },
            data,
            include: { photos: { orderBy: { order: 'asc' } } },
        });
        if (dto.rent || dto.city || dto.roomType || dto.availableFrom) {
            await this.prisma.compatibilityScore.deleteMany({
                where: { targetPropertyId: id },
            });
        }
        return updated;
    }
    async updateStatus(id, ownerId, status) {
        const property = await this.prisma.property.findUnique({ where: { id } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.ownerId !== ownerId)
            throw new common_1.ForbiddenException('Not your property');
        return this.prisma.property.update({
            where: { id },
            data: { status },
        });
    }
    async remove(id, ownerId) {
        const property = await this.prisma.property.findUnique({ where: { id } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.ownerId !== ownerId)
            throw new common_1.ForbiddenException('Not your property');
        return this.prisma.property.update({
            where: { id },
            data: { status: client_1.ListingStatus.INACTIVE },
        });
    }
    async reorderPhotos(propertyId, ownerId, photos) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.ownerId !== ownerId)
            throw new common_1.ForbiddenException('Not your property');
        await this.prisma.$transaction(photos.map((p) => this.prisma.propertyPhoto.update({
            where: { id: p.id },
            data: { order: p.order },
        })));
        return { message: 'Photos reordered' };
    }
    async getAnalytics(ownerId) {
        const properties = await this.prisma.property.findMany({
            where: { ownerId },
            select: {
                id: true,
                title: true,
                viewCount: true,
                interestCount: true,
                status: true,
                createdAt: true,
                _count: { select: { interests: true, favorites: true, views: true } },
            },
        });
        return properties.map((p) => ({
            ...p,
            interestRate: p.viewCount > 0 ? ((p._count.interests / p.viewCount) * 100).toFixed(1) + '%' : '0%',
        }));
    }
    haversine(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
                Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map