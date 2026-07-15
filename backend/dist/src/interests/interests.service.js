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
exports.InterestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
const email_service_js_1 = require("../email/email.service.js");
const scoring_service_js_1 = require("../scoring/scoring.service.js");
let InterestsService = class InterestsService {
    prisma;
    notificationsService;
    emailService;
    scoringService;
    constructor(prisma, notificationsService, emailService, scoringService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.emailService = emailService;
        this.scoringService = scoringService;
    }
    async create(fromUserId, dto) {
        if (dto.targetType === 'PROPERTY') {
            if (!dto.targetPropertyId)
                throw new common_1.BadRequestException('targetPropertyId is required for PROPERTY type');
            const property = await this.prisma.property.findUnique({
                where: { id: dto.targetPropertyId },
                include: { owner: true },
            });
            if (!property)
                throw new common_1.NotFoundException('Property not found');
            if (property.ownerId === fromUserId)
                throw new common_1.BadRequestException('Cannot express interest in your own property');
            if (property.status !== 'ACTIVE')
                throw new common_1.BadRequestException('Property is not active');
            const existing = await this.prisma.interest.findFirst({
                where: {
                    fromUserId,
                    targetType: 'PROPERTY',
                    targetPropertyId: dto.targetPropertyId,
                    status: { not: 'DECLINED' },
                },
            });
            if (existing)
                throw new common_1.BadRequestException('You already have a pending/accepted interest for this property');
        }
        else if (dto.targetType === 'SEEKER_PROFILE') {
            if (!dto.targetSeekerProfileId)
                throw new common_1.BadRequestException('targetSeekerProfileId is required for SEEKER_PROFILE type');
            const targetProfile = await this.prisma.seekerProfile.findUnique({
                where: { id: dto.targetSeekerProfileId },
                include: { user: true },
            });
            if (!targetProfile)
                throw new common_1.NotFoundException('Seeker profile not found');
            if (targetProfile.userId === fromUserId)
                throw new common_1.BadRequestException('Cannot express interest in yourself');
            const existing = await this.prisma.interest.findFirst({
                where: {
                    fromUserId,
                    targetType: 'SEEKER_PROFILE',
                    targetSeekerProfileId: dto.targetSeekerProfileId,
                    status: { not: 'DECLINED' },
                },
            });
            if (existing)
                throw new common_1.BadRequestException('You already have a pending/accepted interest for this profile');
        }
        const interest = await this.prisma.interest.create({
            data: {
                fromUserId,
                targetType: dto.targetType,
                targetPropertyId: dto.targetPropertyId || null,
                targetSeekerProfileId: dto.targetSeekerProfileId || null,
            },
            include: {
                fromUser: { select: { id: true, name: true, email: true } },
                targetProperty: { include: { owner: { select: { id: true, name: true, email: true } } } },
                targetSeekerProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
            },
        });
        if (dto.targetType === 'PROPERTY' && dto.targetPropertyId) {
            await this.prisma.property.update({
                where: { id: dto.targetPropertyId },
                data: { interestCount: { increment: 1 } },
            }).catch(() => { });
        }
        const fromUser = interest.fromUser;
        let targetUserId;
        let targetEmail;
        let targetName;
        let contextTitle;
        if (dto.targetType === 'PROPERTY' && interest.targetProperty) {
            targetUserId = interest.targetProperty.owner.id;
            targetEmail = interest.targetProperty.owner.email;
            targetName = interest.targetProperty.owner.name;
            contextTitle = interest.targetProperty.title;
            const seekerProfile = await this.prisma.seekerProfile.findUnique({ where: { userId: fromUserId } });
            if (seekerProfile) {
                const scoreResult = await this.scoringService.scoreProperty(seekerProfile.id, dto.targetPropertyId);
                const score = scoreResult.status === 'cached' ? scoreResult.score?.score : null;
                if (score && score >= 80) {
                    const emailPayload = this.emailService.interestReceivedEmail(targetName, fromUser.name, interest.targetProperty, score);
                    emailPayload.to = targetEmail;
                    await this.emailService.sendEmail(emailPayload);
                }
            }
        }
        else if (dto.targetType === 'SEEKER_PROFILE' && interest.targetSeekerProfile) {
            targetUserId = interest.targetSeekerProfile.user.id;
            targetEmail = interest.targetSeekerProfile.user.email;
            targetName = interest.targetSeekerProfile.user.name;
            contextTitle = `${interest.targetSeekerProfile.user.name}'s flatmate profile`;
        }
        else {
            return interest;
        }
        await this.notificationsService.create(targetUserId, 'INTEREST_RECEIVED', 'New Interest Received', `${fromUser.name} expressed interest in ${contextTitle}`, { interestId: interest.id });
        return interest;
    }
    async findSent(userId) {
        return this.prisma.interest.findMany({
            where: { fromUserId: userId },
            include: {
                targetProperty: {
                    include: {
                        photos: { orderBy: { order: 'asc' }, take: 1 },
                        owner: { select: { id: true, name: true, avatarUrl: true } },
                    },
                },
                targetSeekerProfile: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                },
                chatRoom: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findReceived(userId) {
        const userProperties = await this.prisma.property.findMany({
            where: { ownerId: userId },
            select: { id: true },
        });
        const seekerProfile = await this.prisma.seekerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        const propertyIds = userProperties.map((p) => p.id);
        return this.prisma.interest.findMany({
            where: {
                OR: [
                    ...(propertyIds.length > 0
                        ? [{ targetType: 'PROPERTY', targetPropertyId: { in: propertyIds } }]
                        : []),
                    ...(seekerProfile
                        ? [{ targetType: 'SEEKER_PROFILE', targetSeekerProfileId: seekerProfile.id }]
                        : []),
                ],
            },
            include: {
                fromUser: { select: { id: true, name: true, avatarUrl: true, email: true } },
                targetProperty: {
                    include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
                },
                targetSeekerProfile: true,
                chatRoom: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async accept(interestId, userId) {
        const interest = await this.getInterestForResponse(interestId, userId);
        const updated = await this.prisma.interest.update({
            where: { id: interestId },
            data: { status: 'ACCEPTED', respondedAt: new Date() },
            include: {
                fromUser: { select: { id: true, name: true, email: true } },
                targetProperty: { include: { owner: { select: { id: true, name: true } } } },
                targetSeekerProfile: { include: { user: true } },
            },
        });
        await this.prisma.chatRoom.create({
            data: { interestId },
        });
        const contextTitle = updated.targetProperty?.title
            || `${updated.targetSeekerProfile?.user.name}'s profile`;
        await this.notificationsService.create(updated.fromUser.id, 'INTEREST_ACCEPTED', 'Interest Accepted! 🎉', `Your interest in ${contextTitle} was accepted. You can now chat!`, { interestId, chatEnabled: true });
        if (updated.targetProperty) {
            const email = this.emailService.interestAcceptedEmail(updated.fromUser.name, updated.targetProperty, interestId);
            email.to = updated.fromUser.email;
            await this.emailService.sendEmail(email);
        }
        return updated;
    }
    async decline(interestId, userId) {
        const interest = await this.getInterestForResponse(interestId, userId);
        const updated = await this.prisma.interest.update({
            where: { id: interestId },
            data: { status: 'DECLINED', respondedAt: new Date() },
            include: {
                fromUser: { select: { id: true, name: true, email: true } },
                targetProperty: true,
                targetSeekerProfile: { include: { user: true } },
            },
        });
        const contextTitle = updated.targetProperty?.title
            || `${updated.targetSeekerProfile?.user.name}'s profile`;
        await this.notificationsService.create(updated.fromUser.id, 'INTEREST_DECLINED', 'Interest Update', `Your interest in ${contextTitle} was declined.`, { interestId });
        if (updated.targetProperty) {
            const email = this.emailService.interestDeclinedEmail(updated.fromUser.name, updated.targetProperty);
            email.to = updated.fromUser.email;
            await this.emailService.sendEmail(email);
        }
        return updated;
    }
    async getInterestForResponse(interestId, userId) {
        const interest = await this.prisma.interest.findUnique({
            where: { id: interestId },
            include: {
                targetProperty: true,
                targetSeekerProfile: true,
            },
        });
        if (!interest)
            throw new common_1.NotFoundException('Interest not found');
        if (interest.status !== 'PENDING')
            throw new common_1.BadRequestException('Interest already responded to');
        let isTarget = false;
        if (interest.targetType === 'PROPERTY' && interest.targetProperty) {
            isTarget = interest.targetProperty.ownerId === userId;
        }
        else if (interest.targetType === 'SEEKER_PROFILE' && interest.targetSeekerProfile) {
            isTarget = interest.targetSeekerProfile.userId === userId;
        }
        if (!isTarget)
            throw new common_1.ForbiddenException('You are not the target of this interest');
        return interest;
    }
};
exports.InterestsService = InterestsService;
exports.InterestsService = InterestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        notifications_service_js_1.NotificationsService,
        email_service_js_1.EmailService,
        scoring_service_js_1.ScoringService])
], InterestsService);
//# sourceMappingURL=interests.service.js.map