import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScoringService } from './scoring.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Compatibility Scoring')
@Controller('scores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TENANT)
@ApiBearerAuth()
export class ScoringController {
  constructor(
    private scoringService: ScoringService,
    private prisma: PrismaService,
  ) {}

  @Post('property/:propertyId')
  @ApiOperation({ summary: 'Trigger scoring for a property (returns cached or queues job)' })
  async scoreProperty(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    const seekerProfile = await this.prisma.seekerProfile.findUnique({
      where: { userId },
    });
    if (!seekerProfile) {
      throw new NotFoundException('Create a seeker profile first');
    }
    return this.scoringService.scoreProperty(seekerProfile.id, propertyId);
  }

  @Post('seeker/:seekerProfileId')
  @ApiOperation({ summary: 'Trigger scoring for flatmate matching' })
  async scoreSeeker(
    @CurrentUser('id') userId: string,
    @Param('seekerProfileId') seekerProfileId: string,
  ) {
    const seekerProfile = await this.prisma.seekerProfile.findUnique({
      where: { userId },
    });
    if (!seekerProfile) {
      throw new NotFoundException('Create a seeker profile first');
    }
    return this.scoringService.scoreSeeker(seekerProfile.id, seekerProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific score by ID' })
  async getScore(@Param('id') id: string) {
    return this.scoringService.getScore(id);
  }
}
