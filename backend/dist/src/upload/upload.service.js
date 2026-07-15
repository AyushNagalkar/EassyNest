"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const crypto_1 = require("crypto");
let UploadService = class UploadService {
    configService;
    prisma;
    supabase;
    bucket;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('supabase.url'), this.configService.get('supabase.serviceRoleKey'));
        this.bucket = this.configService.get('supabase.storageBucket');
    }
    async uploadPropertyPhotos(propertyId, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one photo is required');
        }
        if (files.length > 10) {
            throw new common_1.BadRequestException('Maximum 10 photos per upload');
        }
        const existing = await this.prisma.propertyPhoto.findMany({
            where: { propertyId },
            orderBy: { order: 'desc' },
            take: 1,
        });
        let nextOrder = existing.length > 0 ? existing[0].order + 1 : 0;
        const results = [];
        for (const file of files) {
            const ext = file.originalname.split('.').pop() || 'jpg';
            const fileName = `${propertyId}/${(0, crypto_1.randomUUID)()}.${ext}`;
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
    async uploadChatImage(file) {
        const ext = file.originalname.split('.').pop() || 'jpg';
        const fileName = `chat/${(0, crypto_1.randomUUID)()}.${ext}`;
        const { error } = await this.supabase.storage
            .from(this.bucket)
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            throw new common_1.BadRequestException('Failed to upload image');
        }
        const { data: urlData } = this.supabase.storage
            .from(this.bucket)
            .getPublicUrl(fileName);
        return urlData.publicUrl;
    }
    async uploadAvatar(userId, file) {
        const ext = file.originalname.split('.').pop() || 'jpg';
        const fileName = `avatars/${userId}.${ext}`;
        const { error } = await this.supabase.storage
            .from(this.bucket)
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            throw new common_1.BadRequestException('Failed to upload avatar');
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
    async deletePhoto(photoId) {
        const photo = await this.prisma.propertyPhoto.findUnique({ where: { id: photoId } });
        if (!photo)
            return;
        const url = new URL(photo.url);
        const path = url.pathname.split(`/${this.bucket}/`)[1];
        if (path) {
            await this.supabase.storage.from(this.bucket).remove([path]);
        }
        await this.prisma.propertyPhoto.delete({ where: { id: photoId } });
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_js_1.PrismaService])
], UploadService);
//# sourceMappingURL=upload.service.js.map