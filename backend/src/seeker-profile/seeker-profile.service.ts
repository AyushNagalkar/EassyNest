import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateSeekerProfileDto,
  UpdateSeekerProfileDto,
  SeekerQueryDto,
} from './dto/seeker-profile.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class SeekerProfileService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSeekerProfileDto) {
    const existing = await this.prisma.seekerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Seeker profile already exists. Use PATCH to update.');
    }

    if (dto.budgetMax <= dto.budgetMin) {
      throw new BadRequestException('Budget max must be greater than budget min');
    }

    return this.prisma.seekerProfile.create({
      data: {
        userId,
        type: dto.type,
        preferredCity: dto.preferredCity,
        preferredLat: dto.preferredLat,
        preferredLng: dto.preferredLng,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        moveInDate: new Date(dto.moveInDate),
        bio: dto.bio,
        isPublic: dto.isPublic ?? true,
        sleepSchedule: dto.sleepSchedule,
        cleanliness: dto.cleanliness,
        smoking: dto.smoking,
        pets: dto.pets,
        workFromHome: dto.workFromHome,
        genderPreference: dto.genderPreference ?? 'ANY',
        occupation: dto.occupation,
        age: dto.age,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, emailVerified: true } },
      },
    });
  }

  async findMine(userId: string) {
    const profile = await this.prisma.seekerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, emailVerified: true } },
      },
    });
    if (!profile) {
      throw new NotFoundException('No seeker profile found. Create one first.');
    }
    return profile;
  }

  async findById(id: string) {
    const profile = await this.prisma.seekerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
            createdAt: true,
            _count: { select: { reviewsReceived: true } },
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException('Seeker profile not found');
    }
    return profile;
  }

  async update(userId: string, dto: UpdateSeekerProfileDto) {
    const profile = await this.prisma.seekerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('No seeker profile found');
    }

    if (dto.budgetMin !== undefined && dto.budgetMax !== undefined) {
      if (dto.budgetMax <= dto.budgetMin) {
        throw new BadRequestException('Budget max must be greater than budget min');
      }
    }

    const data: any = { ...dto };
    if (dto.moveInDate) data.moveInDate = new Date(dto.moveInDate);

    const updated = await this.prisma.seekerProfile.update({
      where: { userId },
      data,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Invalidate cached scores when profile changes materially
    if (dto.budgetMin || dto.budgetMax || dto.preferredCity || dto.moveInDate) {
      await this.prisma.compatibilityScore.deleteMany({
        where: { seekerProfileId: profile.id },
      });
    }

    return updated;
  }

  async browse(query: SeekerQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SeekerProfileWhereInput = {
      isPublic: true,
      type: { in: ['FLATMATE_SEEKER', 'BOTH'] },
    };

    if (query.city) {
      where.preferredCity = { contains: query.city, mode: 'insensitive' };
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.minBudget !== undefined) {
      where.budgetMax = { gte: query.minBudget };
    }
    if (query.maxBudget !== undefined) {
      where.budgetMin = { lte: query.maxBudget };
    }
    if (query.genderPreference) {
      where.genderPreference = { in: [query.genderPreference, 'ANY'] };
    }

    const [profiles, total] = await Promise.all([
      this.prisma.seekerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, emailVerified: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.seekerProfile.count({ where }),
    ]);

    return {
      data: profiles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
