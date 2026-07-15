import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    // Register push handler for real-time notifications
    this.notificationsService.setPushHandler((userId, notification) => {
      this.server.to(`user:${userId}`).emit('notification:new', notification);
    });
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Socket connection without token');
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      socket.userId = payload.sub;
      socket.userName = payload.email;

      // Join user's personal room for notifications
      socket.join(`user:${payload.sub}`);

      // Track online status
      if (!this.onlineUsers.has(payload.sub)) {
        this.onlineUsers.set(payload.sub, new Set());
      }
      this.onlineUsers.get(payload.sub)!.add(socket.id);

      // Broadcast online status
      this.server.emit('presence:update', {
        userId: payload.sub,
        status: 'online',
      });

      // Update last seen
      this.prisma.user
        .update({
          where: { id: payload.sub },
          data: { lastSeenAt: new Date() },
        })
        .catch(() => {});

      this.logger.log(`User ${payload.sub} connected (socket: ${socket.id})`);
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${error}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      const sockets = this.onlineUsers.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(socket.userId);
          // Broadcast offline status
          this.server.emit('presence:update', {
            userId: socket.userId,
            status: 'offline',
          });
          // Update last seen
          this.prisma.user
            .update({
              where: { id: socket.userId },
              data: { lastSeenAt: new Date() },
            })
            .catch(() => {});
        }
      }
      this.logger.log(`User ${socket.userId} disconnected (socket: ${socket.id})`);
    }
  }

  @SubscribeMessage('chat:join')
  async handleJoinRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    if (!socket.userId) return;

    const isMember = await this.chatService.validateChatRoomMembership(
      data.chatRoomId,
      socket.userId,
    );
    if (!isMember) {
      socket.emit('error', { message: 'Not a participant of this chat' });
      return;
    }

    socket.join(`chat:${data.chatRoomId}`);
    this.logger.log(`User ${socket.userId} joined chat:${data.chatRoomId}`);
    socket.emit('chat:joined', { chatRoomId: data.chatRoomId });
  }

  @SubscribeMessage('chat:leave')
  handleLeaveRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    socket.leave(`chat:${data.chatRoomId}`);
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      chatRoomId: string;
      content: string;
      type?: 'TEXT' | 'IMAGE';
      imageUrl?: string;
    },
  ) {
    if (!socket.userId) return;

    const isMember = await this.chatService.validateChatRoomMembership(
      data.chatRoomId,
      socket.userId,
    );
    if (!isMember) {
      socket.emit('error', { message: 'Not a participant of this chat' });
      return;
    }

    // Persist the message
    const message = await this.chatService.createMessage(
      data.chatRoomId,
      socket.userId,
      data.content,
      (data.type as any) || 'TEXT',
      data.imageUrl,
    );

    // Broadcast to room
    this.server.to(`chat:${data.chatRoomId}`).emit('chat:message', message);

    // Send notification to recipient if offline/not in room
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: data.chatRoomId },
      include: {
        interest: {
          include: {
            fromUser: { select: { id: true } },
            targetProperty: { select: { ownerId: true } },
            targetSeekerProfile: { select: { userId: true } },
          },
        },
      },
    });

    if (chatRoom) {
      const recipientIds = this.getOtherParticipants(chatRoom.interest, socket.userId);
      for (const recipientId of recipientIds) {
        // Check if recipient is in the chat room
        const recipientSockets = this.onlineUsers.get(recipientId);
        let isInRoom = false;
        if (recipientSockets) {
          for (const sid of recipientSockets) {
            try {
              const s = this.server.sockets?.sockets?.get(sid) ?? (this.server as any).of('/')?.sockets?.get(sid);
              if (s?.rooms?.has(`chat:${data.chatRoomId}`)) {
                isInRoom = true;
                break;
              }
            } catch {
              // Socket may have disconnected between lookup and check
            }
          }
        }

        if (!isInRoom) {
          await this.notificationsService.create(
            recipientId,
            'NEW_MESSAGE',
            'New Message',
            `${message.sender.name}: ${data.content.substring(0, 100)}`,
            { chatRoomId: data.chatRoomId },
          );
        }
      }
    }
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string; isTyping: boolean },
  ) {
    if (!socket.userId) return;
    socket.to(`chat:${data.chatRoomId}`).emit('chat:typing', {
      userId: socket.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('chat:read')
  async handleReadReceipt(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    if (!socket.userId) return;

    const result = await this.chatService.markAsRead(data.chatRoomId, socket.userId);

    // Broadcast read receipt to other participants
    socket.to(`chat:${data.chatRoomId}`).emit('chat:read', {
      chatRoomId: data.chatRoomId,
      userId: socket.userId,
      readAt: result.readAt,
    });
  }

  @SubscribeMessage('presence:check')
  handlePresenceCheck(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { userIds: string[] },
  ) {
    const statuses = data.userIds.map((userId) => ({
      userId,
      status: this.onlineUsers.has(userId) ? 'online' : 'offline',
    }));
    socket.emit('presence:status', statuses);
  }

  private getOtherParticipants(interest: any, currentUserId: string): string[] {
    const participants = new Set<string>();
    participants.add(interest.fromUser?.id || interest.fromUserId);
    if (interest.targetProperty?.ownerId) participants.add(interest.targetProperty.ownerId);
    if (interest.targetSeekerProfile?.userId) participants.add(interest.targetSeekerProfile.userId);
    participants.delete(currentUserId);
    return [...participants];
  }
}
