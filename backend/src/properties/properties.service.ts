import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyQueryDto,
} from './dto/property.dto.js';
import { ListingStatus, Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreatePropertyDto) {
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

  async findMine(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId, status: { not: ListingStatus.INACTIVE } },
      include: {
        photos: { orderBy: { order: 'asc' } },
        _count: { select: { interests: true, favorites: true, views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, viewerIp?: string, viewerId?: string) {
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
      throw new NotFoundException('Property not found');
    }

    // Track view + increment counter (fire-and-forget)
    this.prisma.propertyView
      .create({ data: { propertyId: id, viewerIp, viewerId } })
      .catch(() => {});
    this.prisma.property
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return property;
  }

  async browse(query: PropertyQueryDto, seekerProfileId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.minRent !== undefined) {
      where.rent = { ...(where.rent as object || {}), gte: query.minRent };
    }
    if (query.maxRent !== undefined) {
      where.rent = { ...(where.rent as object || {}), lte: query.maxRent };
    }
    if (query.roomType) {
      const types = query.roomType.split(',');
      where.roomType = { in: types as any };
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

    // Geo-filter: bounding box approximation then Haversine in app layer
    if (query.lat && query.lng && query.radiusKm) {
      const latDelta = query.radiusKm / 111.0;
      const lngDelta = query.radiusKm / (111.0 * Math.cos((query.lat * Math.PI) / 180));
      where.lat = { gte: query.lat - latDelta, lte: query.lat + latDelta };
      where.lng = { gte: query.lng - lngDelta, lte: query.lng + lngDelta };
    }

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') orderBy = { rent: 'asc' };
    else if (query.sortBy === 'price_desc') orderBy = { rent: 'desc' };

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

    // Attach scores if seeker profile exists
    let propertiesWithScores = properties.map((p) => ({ ...p, compatibilityScore: null as any }));
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

      // Sort by score if requested
      if (query.sortBy === 'score') {
        propertiesWithScores.sort((a, b) => {
          const scoreA = a.compatibilityScore?.score ?? -1;
          const scoreB = b.compatibilityScore?.score ?? -1;
          return scoreB - scoreA;
        });
      }
    }

    // Post-filter by exact distance if geo-filter was used
    let filtered = propertiesWithScores;
    if (query.lat && query.lng && query.radiusKm) {
      filtered = propertiesWithScores.filter((p) => {
        const dist = this.haversine(query.lat!, query.lng!, p.lat, p.lng);
        return dist <= query.radiusKm!;
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

  async update(id: string, ownerId: string, dto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== ownerId) throw new ForbiddenException('Not your property');

    const data: any = { ...dto };
    if (dto.availableFrom) data.availableFrom = new Date(dto.availableFrom);

    const updated = await this.prisma.property.update({
      where: { id },
      data,
      include: { photos: { orderBy: { order: 'asc' } } },
    });

    // Invalidate cached compatibility scores when listing changes materially
    if (dto.rent || dto.city || dto.roomType || dto.availableFrom) {
      await this.prisma.compatibilityScore.deleteMany({
        where: { targetPropertyId: id },
      });
    }

    return updated;
  }

  async updateStatus(id: string, ownerId: string, status: ListingStatus) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== ownerId) throw new ForbiddenException('Not your property');

    return this.prisma.property.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, ownerId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== ownerId) throw new ForbiddenException('Not your property');

    return this.prisma.property.update({
      where: { id },
      data: { status: ListingStatus.INACTIVE },
    });
  }

  async reorderPhotos(propertyId: string, ownerId: string, photos: { id: string; order: number }[]) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== ownerId) throw new ForbiddenException('Not your property');

    await this.prisma.$transaction(
      photos.map((p) =>
        this.prisma.propertyPhoto.update({
          where: { id: p.id },
          data: { order: p.order },
        }),
      ),
    );

    return { message: 'Photos reordered' };
  }

  async getAnalytics(ownerId: string) {
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

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
