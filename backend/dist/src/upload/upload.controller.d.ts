import { UploadService } from './upload.service.js';
export declare class UploadController {
    private uploadService;
    constructor(uploadService: UploadService);
    uploadPropertyPhotos(propertyId: string, files: Express.Multer.File[]): Promise<{
        id: string;
        url: string;
        order: number;
    }[]>;
    uploadChatImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    deletePhoto(photoId: string): Promise<{
        message: string;
    }>;
}
