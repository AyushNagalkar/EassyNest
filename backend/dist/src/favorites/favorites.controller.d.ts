import { PrismaService } from '../prisma/prisma.service.js';
export declare class FavoritesController {
    private prisma;
    constructor(prisma: PrismaService);
    toggle(propertyId: string, userId: string): Promise<{
        favorited: boolean;
    }>;
    findAll(userId: string): Promise<({
        property: {
            owner: {
                id: string;
                name: string;
            };
            photos: {
                id: string;
                order: number;
                propertyId: string;
                url: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            title: string;
            description: string;
            city: string;
            address: string;
            lat: number;
            lng: number;
            rent: number;
            availableFrom: Date;
            roomType: import("@prisma/client").$Enums.RoomType;
            furnishing: import("@prisma/client").$Enums.FurnishingStatus;
            amenities: string[];
            rules: string[];
            petFriendly: boolean;
            leaseLengthMonths: number | null;
            status: import("@prisma/client").$Enums.ListingStatus;
            viewCount: number;
            interestCount: number;
            ownerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        propertyId: string;
    })[]>;
}
