import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.serviceRoleKey')!,
    );
    this.bucket = this.configService.get<string>('supabase.storageBucket')!;
  }

  async uploadPropertyPhotos(
    propertyId: string,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one photo is required');
    }
    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 photos per upload');
    }

    // Get current max order
    const existing = await this.prisma.propertyPhoto.findMany({
      where: { propertyId },
      orderBy: { order: 'desc' },
      take: 1,
    });
    let nextOrder = existing.length > 0 ? existing[0].order + 1 : 0;

    const results: { id: string; url: string; order: number }[] = [];

    for (const file of files) {
      const ext = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${propertyId}/${randomUUID()}.${ext}`;

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        continue;
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(fileName);

      const photo = await this.prisma.propertyPhoto.create({
        data: {
          propertyId,
          url: urlData.publicUrl,
          order: nextOrder++,
        },
      });

      results.push({ id: photo.id, url: photo.url, order: photo.order });
    }

    return results;
  }

  async uploadChatImage(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const fileName = `chat/${randomUUID()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException('Failed to upload image');
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const fileName = `avatars/${userId}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException('Failed to upload avatar');
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: urlData.publicUrl },
    });

    return urlData.publicUrl;
  }

  async deletePhoto(photoId: string) {
    const photo = await this.prisma.propertyPhoto.findUnique({ where: { id: photoId } });
    if (!photo) return;

    // Extract path from URL
    const url = new URL(photo.url);
    const path = url.pathname.split(`/${this.bucket}/`)[1];
    if (path) {
      await this.supabase.storage.from(this.bucket).remove([path]);
    }

    await this.prisma.propertyPhoto.delete({ where: { id: photoId } });
  }
}
