import { RoomType, FurnishingStatus, GenderPreference } from '@prisma/client';
export declare class CreatePropertyDto {
    title: string;
    description: string;
    city: string;
    address: string;
    lat: number;
    lng: number;
    rent: number;
    availableFrom: string;
    roomType: RoomType;
    furnishing: FurnishingStatus;
    amenities?: string[];
    rules?: string[];
    petFriendly?: boolean;
    genderPreference?: GenderPreference;
    leaseLengthMonths?: number;
}
export declare class UpdatePropertyDto {
    title?: string;
    description?: string;
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
    rent?: number;
    availableFrom?: string;
    roomType?: RoomType;
    furnishing?: FurnishingStatus;
    amenities?: string[];
    rules?: string[];
    petFriendly?: boolean;
    genderPreference?: GenderPreference;
    leaseLengthMonths?: number;
}
export declare class PropertyQueryDto {
    city?: string;
    minRent?: number;
    maxRent?: number;
    roomType?: string;
    furnishing?: FurnishingStatus;
    amenities?: string;
    petFriendly?: boolean;
    genderPreference?: GenderPreference;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
}
export declare class UpdateStatusDto {
    status: 'ACTIVE' | 'FILLED' | 'INACTIVE';
}
export declare class ReorderPhotosDto {
    photos: {
        id: string;
        order: number;
    }[];
}
