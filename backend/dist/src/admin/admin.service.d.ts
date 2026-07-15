import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: {
            total: number;
            owners: number;
            tenants: number;
        };
        properties: {
            total: number;
            active: number;
        };
        interests: {
            total: number;
            accepted: number;
        };
        scores: number;
        messages: number;
        recentSignups: number;
    }>;
    getUsers(page?: number, limit?: number, role?: string, search?: string): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            emailVerified: boolean;
            createdAt: Date;
            _count: {
                properties: number;
                sentInterests: number;
                messages: number;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    deactivateUser(userId: string, adminId: string): Promise<{
        id: string;
        email: string;
        name: string;
        isActive: boolean;
    }>;
    reactivateUser(userId: string, adminId: string): Promise<{
        id: string;
        email: string;
        name: string;
        isActive: boolean;
    }>;
    getProperties(page?: number, limit?: number, status?: string, search?: string): Promise<{
        data: ({
            owner: {
                id: string;
                email: string;
                name: string;
            };
            photos: {
                id: string;
                order: number;
                propertyId: string;
                url: string;
            }[];
            _count: {
                favorites: number;
                flags: number;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    forceRemoveProperty(propertyId: string, adminId: string): Promise<{
        message: string;
    }>;
    getActivity(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            targetType: string | null;
            targetId: string | null;
            actorId: string | null;
            action: string;
            meta: Prisma.JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFlags(page?: number, limit?: number, status?: string): Promise<{
        data: ({
            property: {
                id: string;
                title: string;
            } | null;
            creator: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.FlagStatus;
            targetType: string;
            targetId: string;
            propertyId: string | null;
            creatorId: string;
            reason: import("@prisma/client").$Enums.FlagReason;
            details: string | null;
            reviewedAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    reviewFlag(flagId: string, adminId: string, action: 'DISMISSED' | 'ACTIONED'): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FlagStatus;
        targetType: string;
        targetId: string;
        propertyId: string | null;
        creatorId: string;
        reason: import("@prisma/client").$Enums.FlagReason;
        details: string | null;
        reviewedAt: Date | null;
    }>;
    exportUsersCsv(): Promise<string>;
    exportListingsCsv(): Promise<string>;
}
