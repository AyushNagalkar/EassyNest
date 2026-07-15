import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InterestsService } from './interests.service.js';
import { CreateInterestDto } from './dto/interest.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Interests')
@Controller('interests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InterestsController {
  constructor(private interestsService: InterestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.TENANT)
  @ApiOperation({ summary: 'Express interest in a property or seeker profile' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInterestDto,
  ) {
    return this.interestsService.create(userId, dto);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get interests sent by this user' })
  async findSent(@CurrentUser('id') userId: string) {
    return this.interestsService.findSent(userId);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get interests received (for properties owned or seeker profile)' })
  async findReceived(@CurrentUser('id') userId: string) {
    return this.interestsService.findReceived(userId);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept an interest (creates ChatRoom)' })
  async accept(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.interestsService.accept(id, userId);
  }

  @Patch(':id/decline')
  @ApiOperation({ summary: 'Decline an interest' })
  async decline(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.interestsService.decline(id, userId);
  }
}
