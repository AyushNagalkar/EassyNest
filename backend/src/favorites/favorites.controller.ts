import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TENANT)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private prisma: PrismaService) {}

  @Post(':propertyId')
  @ApiOperation({ summary: 'Toggle favorite on a property' })
  async toggle(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') userId: string,
  ) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, propertyId },
    });
    return { favorited: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get saved/favorited listings' })
  async findAll(@CurrentUser('id') userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            photos: { orderBy: { order: 'asc' }, take: 1 },
            owner: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites;
  }
}
