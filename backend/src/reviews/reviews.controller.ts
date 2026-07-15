import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class CreateReviewDto {
  @IsString()
  interestId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  comment?: string;
}

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Leave a review for a user after an accepted interest' })
  async create(
    @CurrentUser('id') authorId: string,
    @Body() dto: CreateReviewDto,
  ) {
    // Verify interest exists and is accepted
    const interest = await this.prisma.interest.findUnique({
      where: { id: dto.interestId },
      include: {
        targetProperty: { select: { ownerId: true } },
        targetSeekerProfile: { select: { userId: true } },
      },
    });

    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.status !== 'ACCEPTED') {
      throw new BadRequestException('Can only review after an accepted interest');
    }

    // Determine target user
    let targetId: string;
    if (interest.fromUserId === authorId) {
      // Reviewer is the tenant — reviewing the owner/other seeker
      targetId = interest.targetProperty?.ownerId || interest.targetSeekerProfile?.userId || '';
    } else {
      // Reviewer is the owner/target — reviewing the tenant
      targetId = interest.fromUserId;
    }

    if (!targetId || targetId === authorId) {
      throw new BadRequestException('Cannot review yourself');
    }

    return this.prisma.review.create({
      data: {
        authorId,
        targetId,
        interestId: dto.interestId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews for a user' })
  async findForUser(@Param('userId') userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: userId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    return {
      reviews,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      totalReviews: reviews.length,
    };
  }
}
