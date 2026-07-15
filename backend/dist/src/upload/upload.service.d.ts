import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class UploadService {
    private configService;
    private prisma;
    private supabase;
    private bucket;
    constructor(configService: ConfigService, prisma: PrismaService);
    uploadPropertyPhotos(propertyId: string, files: Express.Multer.File[]): Promise<{
        id: string;
        url: string;
        order: number;
    }[]>;
    uploadChatImage(file: Express.Multer.File): Promise<string>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<string>;
    deletePhoto(photoId: string): Promise<void>;
}
