import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SeekerProfileService } from './seeker-profile.service.js';
import {
  CreateSeekerProfileDto,
  UpdateSeekerProfileDto,
  SeekerQueryDto,
} from './dto/seeker-profile.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Seeker Profile')
@Controller()
export class SeekerProfileController {
  constructor(private seekerProfileService: SeekerProfileService) {}

  @Post('seeker-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create seeker profile' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSeekerProfileDto,
  ) {
    return this.seekerProfileService.create(userId, dto);
  }

  @Get('seeker-profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own seeker profile' })
  async findMine(@CurrentUser('id') userId: string) {
    return this.seekerProfileService.findMine(userId);
  }

  @Patch('seeker-profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own seeker profile' })
  async update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSeekerProfileDto,
  ) {
    return this.seekerProfileService.update(userId, dto);
  }

  @Get('seekers')
  @ApiOperation({ summary: 'Browse public flatmate-seeker profiles' })
  async browse(@Query() query: SeekerQueryDto) {
    return this.seekerProfileService.browse(query);
  }

  @Get('seekers/:id')
  @ApiOperation({ summary: 'Get seeker profile details' })
  async findOne(@Param('id') id: string) {
    return this.seekerProfileService.findById(id);
  }
}
