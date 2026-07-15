import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { EmailService } from '../email/email.service.js';
import { ScoringService } from '../scoring/scoring.service.js';
import { CreateInterestDto } from './dto/interest.dto.js';

@Injectable()
export class InterestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private scoringService: ScoringService,
  ) {}

  async create(fromUserId: string, dto: CreateInterestDto) {
    // Validate target exists
    if (dto.targetType === 'PROPERTY') {
      if (!dto.targetPropertyId) throw new BadRequestException('targetPropertyId is required for PROPERTY type');
      const property = await this.prisma.property.findUnique({
        where: { id: dto.targetPropertyId },
        include: { owner: true },
      });
      if (!property) throw new NotFoundException('Property not found');
      if (property.ownerId === fromUserId) throw new BadRequestException('Cannot express interest in your own property');
      if (property.status !== 'ACTIVE') throw new BadRequestException('Property is not active');

      // Check for duplicate
      const existing = await this.prisma.interest.findFirst({
        where: {
          fromUserId,
          targetType: 'PROPERTY',
          targetPropertyId: dto.targetPropertyId,
          status: { not: 'DECLINED' },
        },
      });
      if (existing) throw new BadRequestException('You already have a pending/accepted interest for this property');

    } else if (dto.targetType === 'SEEKER_PROFILE') {
      if (!dto.targetSeekerProfileId) throw new BadRequestException('targetSeekerProfileId is required for SEEKER_PROFILE type');
      const targetProfile = await this.prisma.seekerProfile.findUnique({
        where: { id: dto.targetSeekerProfileId },
        include: { user: true },
      });
      if (!targetProfile) throw new NotFoundException('Seeker profile not found');
      if (targetProfile.userId === fromUserId) throw new BadRequestException('Cannot express interest in yourself');

      // Check for duplicate
      const existing = await this.prisma.interest.findFirst({
        where: {
          fromUserId,
          targetType: 'SEEKER_PROFILE',
          targetSeekerProfileId: dto.targetSeekerProfileId,
          status: { not: 'DECLINED' },
        },
      });
      if (existing) throw new BadRequestException('You already have a pending/accepted interest for this profile');
    }

    // Create interest
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

    // Increment interest count on property
    if (dto.targetType === 'PROPERTY' && dto.targetPropertyId) {
      await this.prisma.property.update({
        where: { id: dto.targetPropertyId },
        data: { interestCount: { increment: 1 } },
      }).catch(() => {});
    }

    // Trigger scoring and notify
    const fromUser = interest.fromUser;
    let targetUserId: string;
    let targetEmail: string;
    let targetName: string;
    let contextTitle: string;

    if (dto.targetType === 'PROPERTY' && interest.targetProperty) {
      targetUserId = interest.targetProperty.owner.id;
      targetEmail = interest.targetProperty.owner.email;
      targetName = interest.targetProperty.owner.name;
      contextTitle = interest.targetProperty.title;

      // Trigger scoring
      const seekerProfile = await this.prisma.seekerProfile.findUnique({ where: { userId: fromUserId } });
      if (seekerProfile) {
        const scoreResult = await this.scoringService.scoreProperty(seekerProfile.id, dto.targetPropertyId!);
        const score = scoreResult.status === 'cached' ? scoreResult.score?.score : null;

        // If score > 80, send email to owner
        if (score && score >= 80) {
          const emailPayload = this.emailService.interestReceivedEmail(
            targetName, fromUser.name, interest.targetProperty, score,
          );
          emailPayload.to = targetEmail;
          await this.emailService.sendEmail(emailPayload);
        }
      }
    } else if (dto.targetType === 'SEEKER_PROFILE' && interest.targetSeekerProfile) {
      targetUserId = interest.targetSeekerProfile.user.id;
      targetEmail = interest.targetSeekerProfile.user.email;
      targetName = interest.targetSeekerProfile.user.name;
      contextTitle = `${interest.targetSeekerProfile.user.name}'s flatmate profile`;
    } else {
      return interest;
    }

    // Create notification for recipient
    await this.notificationsService.create(
      targetUserId!,
      'INTEREST_RECEIVED',
      'New Interest Received',
      `${fromUser.name} expressed interest in ${contextTitle!}`,
      { interestId: interest.id },
    );

    return interest;
  }

  async findSent(userId: string) {
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

  async findReceived(userId: string) {
    // Find interests targeting user's properties or seeker profile
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
            ? [{ targetType: 'PROPERTY' as const, targetPropertyId: { in: propertyIds } }]
            : []),
          ...(seekerProfile
            ? [{ targetType: 'SEEKER_PROFILE' as const, targetSeekerProfileId: seekerProfile.id }]
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

  async accept(interestId: string, userId: string) {
    const interest = await this.getInterestForResponse(interestId, userId);

    // Update interest status
    const updated = await this.prisma.interest.update({
      where: { id: interestId },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        targetProperty: { include: { owner: { select: { id: true, name: true } } } },
        targetSeekerProfile: { include: { user: true } },
      },
    });

    // Create ChatRoom
    await this.prisma.chatRoom.create({
      data: { interestId },
    });

    // Notify the sender
    const contextTitle = updated.targetProperty?.title
      || `${updated.targetSeekerProfile?.user.name}'s profile`;

    await this.notificationsService.create(
      updated.fromUser.id,
      'INTEREST_ACCEPTED',
      'Interest Accepted! 🎉',
      `Your interest in ${contextTitle} was accepted. You can now chat!`,
      { interestId, chatEnabled: true },
    );

    // Email the sender
    if (updated.targetProperty) {
      const email = this.emailService.interestAcceptedEmail(
        updated.fromUser.name,
        updated.targetProperty,
        interestId,
      );
      email.to = updated.fromUser.email;
      await this.emailService.sendEmail(email);
    }

    return updated;
  }

  async decline(interestId: string, userId: string) {
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

    // Notify
    await this.notificationsService.create(
      updated.fromUser.id,
      'INTEREST_DECLINED',
      'Interest Update',
      `Your interest in ${contextTitle} was declined.`,
      { interestId },
    );

    // Email
    if (updated.targetProperty) {
      const email = this.emailService.interestDeclinedEmail(
        updated.fromUser.name,
        updated.targetProperty,
      );
      email.to = updated.fromUser.email;
      await this.emailService.sendEmail(email);
    }

    return updated;
  }

  private async getInterestForResponse(interestId: string, userId: string) {
    const interest = await this.prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        targetProperty: true,
        targetSeekerProfile: true,
      },
    });

    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.status !== 'PENDING') throw new BadRequestException('Interest already responded to');

    // Check the current user is the target (owner or seeker profile owner)
    let isTarget = false;
    if (interest.targetType === 'PROPERTY' && interest.targetProperty) {
      isTarget = interest.targetProperty.ownerId === userId;
    } else if (interest.targetType === 'SEEKER_PROFILE' && interest.targetSeekerProfile) {
      isTarget = interest.targetSeekerProfile.userId === userId;
    }

    if (!isTarget) throw new ForbiddenException('You are not the target of this interest');

    return interest;
  }
}
