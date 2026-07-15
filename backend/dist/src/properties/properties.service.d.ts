import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './dto/property.dto.js';
import { ListingStatus } from '@prisma/client';
export declare class PropertiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(ownerId: string, dto: CreatePropertyDto): Promise<{
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
    findMine(ownerId: string): Promise<({
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
    findById(id: string, viewerIp?: string, viewerId?: string): Promise<{
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
    browse(query: PropertyQueryDto, seekerProfileId?: string): Promise<{
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
    update(id: string, ownerId: string, dto: UpdatePropertyDto): Promise<{
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
    updateStatus(id: string, ownerId: string, status: ListingStatus): Promise<{
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
    remove(id: string, ownerId: string): Promise<{
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
    reorderPhotos(propertyId: string, ownerId: string, photos: {
        id: string;
        order: number;
    }[]): Promise<{
        message: string;
    }>;
    getAnalytics(ownerId: string): Promise<{
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
    private haversine;
    private deg2rad;
}
