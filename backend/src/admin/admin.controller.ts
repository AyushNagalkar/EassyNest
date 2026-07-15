import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Res,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with filters' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page || 1, limit || 20, role, search);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate (soft-ban) a user' })
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deactivateUser(id, adminId);
  }

  @Patch('users/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate a user' })
  async reactivateUser(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.reactivateUser(id, adminId);
  }

  @Get('properties')
  @ApiOperation({ summary: 'List all properties' })
  async getProperties(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getProperties(page || 1, limit || 20, status, search);
  }

  @Delete('properties/:id')
  @ApiOperation({ summary: 'Force-remove a property listing' })
  async forceRemoveProperty(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.forceRemoveProperty(id, adminId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Recent admin activity log' })
  async getActivity(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getActivity(page || 1, limit || 20);
  }

  @Get('flags')
  @ApiOperation({ summary: 'Content moderation queue' })
  async getFlags(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getFlags(page || 1, limit || 20, status);
  }

  @Patch('flags/:id')
  @ApiOperation({ summary: 'Review a flag (dismiss or action)' })
  async reviewFlag(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { action: 'DISMISSED' | 'ACTIONED' },
  ) {
    return this.adminService.reviewFlag(id, adminId, body.action);
  }

  @Get('export/users')
  @ApiOperation({ summary: 'Export users as CSV' })
  async exportUsers(@Res() res: Response) {
    const csv = await this.adminService.exportUsersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Permanently delete a user account' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deleteUser(id, adminId);
  }

  @Get('export/listings')
  @ApiOperation({ summary: 'Export listings as CSV' })
  async exportListings(@Res() res: Response) {
    const csv = await this.adminService.exportListingsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=listings.csv');
    res.send(csv);
  }
}
