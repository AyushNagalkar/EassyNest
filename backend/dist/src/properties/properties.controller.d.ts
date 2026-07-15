import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto, UpdateStatusDto, ReorderPhotosDto } from './dto/property.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Request } from 'express';
export declare class PropertiesController {
    private propertiesService;
    private prisma;
    constructor(propertiesService: PropertiesService, prisma: PrismaService);
    create(userId: string, dto: CreatePropertyDto): Promise<{
        owner: {
            id: string;
            name: string;
            avatarUrl: string | null;
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
    }>;
    findMine(userId: string): Promise<({
        photos: {
            id: string;
            order: number;
            propertyId: string;
            url: string;
        }[];
        _count: {
            favorites: number;
            interests: number;
            views: number;
        };
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
    })[]>;
    getAnalytics(userId: string): Promise<{
        interestRate: string;
        id: string;
        createdAt: Date;
        title: string;
        status: import("@prisma/client").$Enums.ListingStatus;
        viewCount: number;
        interestCount: number;
        _count: {
            favorites: number;
            interests: number;
            views: number;
        };
    }[]>;
    browse(query: PropertyQueryDto, req: Request): Promise<{
        data: {
            compatibilityScore: any;
            owner: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
            photos: {
                id: string;
                order: number;
                propertyId: string;
                url: string;
            }[];
            _count: {
                favorites: number;
            };
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
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: Request): Promise<{
        owner: {
            id: string;
            name: string;
            avatarUrl: string | null;
            emailVerified: boolean;
            createdAt: Date;
            _count: {
                properties: number;
            };
        };
        photos: {
            id: string;
            order: number;
            propertyId: string;
            url: string;
        }[];
        _count: {
            favorites: number;
            interests: number;
        };
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
    }>;
    update(id: string, userId: string, dto: UpdatePropertyDto): Promise<{
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
    }>;
    updateStatus(id: string, userId: string, dto: UpdateStatusDto): Promise<{
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
    }>;
    reorderPhotos(id: string, userId: string, dto: ReorderPhotosDto): Promise<{
        message: string;
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
}
