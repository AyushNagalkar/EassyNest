import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class CreateSavedSearchDto {
  @IsString()
  @MinLength(2)
  name: string;

  filters: any; // JSON object: { city, minRent, maxRent, roomType[], amenities[], ... }

  @IsOptional()
  @IsBoolean()
  alertsOn?: boolean;
}

@ApiTags('Saved Searches')
@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedSearchesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a saved search with optional alerts' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSavedSearchDto,
  ) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name: dto.name,
        filters: dto.filters,
        alertsOn: dto.alertsOn ?? true,
      },
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved searches' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved search' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.prisma.savedSearch.deleteMany({
      where: { id, userId },
    });
    return { message: 'Saved search deleted' };
  }
}
