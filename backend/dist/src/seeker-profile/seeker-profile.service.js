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
exports.SeekerProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let SeekerProfileService = class SeekerProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const existing = await this.prisma.seekerProfile.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.ConflictException('Seeker profile already exists. Use PATCH to update.');
        }
        if (dto.budgetMax <= dto.budgetMin) {
            throw new common_1.BadRequestException('Budget max must be greater than budget min');
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
    async findMine(userId) {
        const profile = await this.prisma.seekerProfile.findUnique({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true, emailVerified: true } },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('No seeker profile found. Create one first.');
        }
        return profile;
    }
    async findById(id, userId) {
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
            throw new common_1.NotFoundException('Seeker profile not found');
        }
        let compatibilityScore = null;
        if (userId) {
            const requester = await this.prisma.seekerProfile.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (requester && requester.id !== id) {
                const score = await this.prisma.compatibilityScore.findFirst({
                    where: {
                        seekerProfileId: requester.id,
                        targetType: 'SEEKER_PROFILE',
                        targetSeekerProfileId: id,
                    },
                });
                compatibilityScore = score || null;
            }
        }
        return { ...profile, compatibilityScore };
    }
    async update(userId, dto) {
        const profile = await this.prisma.seekerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('No seeker profile found');
        }
        if (dto.budgetMin !== undefined && dto.budgetMax !== undefined) {
            if (dto.budgetMax <= dto.budgetMin) {
                throw new common_1.BadRequestException('Budget max must be greater than budget min');
            }
        }
        const data = { ...dto };
        if (dto.moveInDate)
            data.moveInDate = new Date(dto.moveInDate);
        const updated = await this.prisma.seekerProfile.update({
            where: { userId },
            data,
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
        if (dto.budgetMin || dto.budgetMax || dto.preferredCity || dto.moveInDate) {
            await this.prisma.compatibilityScore.deleteMany({
                where: { seekerProfileId: profile.id },
            });
        }
        return updated;
    }
    async browse(query, userId) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            isPublic: true,
            type: { in: ['FLATMATE_SEEKER', 'BOTH'] },
        };
        if (userId) {
            where.userId = { not: userId };
        }
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
        let profilesWithScores = profiles.map((p) => ({ ...p, compatibilityScore: null }));
        if (userId) {
            const requester = await this.prisma.seekerProfile.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (requester) {
                const scores = await this.prisma.compatibilityScore.findMany({
                    where: {
                        seekerProfileId: requester.id,
                        targetType: 'SEEKER_PROFILE',
                        targetSeekerProfileId: { in: profiles.map((p) => p.id) },
                    },
                });
                const scoreMap = new Map(scores.map((s) => [s.targetSeekerProfileId, s]));
                profilesWithScores = profiles.map((p) => ({
                    ...p,
                    compatibilityScore: scoreMap.get(p.id) || null,
                }));
                if (query.sortBy === 'score') {
                    profilesWithScores.sort((a, b) => {
                        const scoreA = a.compatibilityScore?.score ?? -1;
                        const scoreB = b.compatibilityScore?.score ?? -1;
                        return scoreB - scoreA;
                    });
                }
            }
        }
        return {
            data: profilesWithScores,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.SeekerProfileService = SeekerProfileService;
exports.SeekerProfileService = SeekerProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SeekerProfileService);
//# sourceMappingURL=seeker-profile.service.js.map