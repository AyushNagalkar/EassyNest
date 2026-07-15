import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('unread-counts')
  @ApiOperation({ summary: 'Get unread message counts per chat room' })
  async getUnreadCounts(@CurrentUser('id') userId: string) {
    return this.chatService.getUnreadCounts(userId);
  }

  @Get(':interestId/messages')
  @ApiOperation({ summary: 'Get paginated chat message history' })
  async getMessages(
    @Param('interestId') interestId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(interestId, userId, page || 1, limit || 50);
  }
}
