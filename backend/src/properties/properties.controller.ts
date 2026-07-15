import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyQueryDto,
  UpdateStatusDto,
  ReorderPhotosDto,
} from './dto/property.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Request } from 'express';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(userId, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get owner's own listings" })
  async findMine(@CurrentUser('id') userId: string) {
    return this.propertiesService.findMine(userId);
  }

  @Get('mine/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for owned properties' })
  async getAnalytics(@CurrentUser('id') userId: string) {
    return this.propertiesService.getAnalytics(userId);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Browse properties with filters (optional auth for compatibility scores)' })
  async browse(@Query() query: PropertyQueryDto, @Req() req: Request) {
    const user = (req as any).user;
    let seekerProfileId: string | undefined;

    // If an authenticated TENANT, look up their seeker profile for scoring
    if (user?.role === 'TENANT') {
      const profile = await this.prisma.seekerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      seekerProfileId = profile?.id;
    }

    return this.propertiesService.browse(query, seekerProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const viewerIp = (req.headers['x-forwarded-for'] as string) || req.ip;
    const viewerId = (req as any).user?.id;
    return this.propertiesService.findById(id, viewerIp, viewerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property listing' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property status (ACTIVE/FILLED/INACTIVE)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.propertiesService.updateStatus(id, userId, dto.status as any);
  }

  @Patch(':id/photos/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder property photos' })
  async reorderPhotos(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderPhotosDto,
  ) {
    return this.propertiesService.reorderPhotos(id, userId, dto.photos);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a property listing' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.propertiesService.remove(id, userId);
  }
}
