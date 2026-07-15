import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { FlagReason } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class CreateFlagDto {
  @IsString()
  targetType: string; // "PROPERTY" | "MESSAGE" | "USER"

  @IsString()
  targetId: string;

  @IsEnum(FlagReason)
  reason: FlagReason;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;
}

@ApiTags('Flags')
@Controller('flags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlagsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Flag content for moderation' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFlagDto,
  ) {
    return this.prisma.flag.create({
      data: {
        creatorId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        details: dto.details,
        propertyId: dto.propertyId,
      },
    });
  }
}
