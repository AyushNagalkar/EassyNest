import { InterestsService } from './interests.service.js';
import { CreateInterestDto } from './dto/interest.dto.js';
export declare class InterestsController {
    private interestsService;
    constructor(interestsService: InterestsService);
    create(userId: string, dto: CreateInterestDto): Promise<{
        targetProperty: ({
            owner: {
                id: string;
                email: string;
                name: string;
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
        }) | null;
        targetSeekerProfile: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.SeekerType;
            preferredCity: string;
            preferredLat: number | null;
            preferredLng: number | null;
            budgetMin: number;
            budgetMax: number;
            moveInDate: Date;
            bio: string | null;
            isPublic: boolean;
            sleepSchedule: string | null;
            cleanliness: string | null;
            smoking: string | null;
            pets: string | null;
            workFromHome: boolean | null;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            occupation: string | null;
            age: number | null;
            userId: string;
        }) | null;
        fromUser: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InterestStatus;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
        respondedAt: Date | null;
        fromUserId: string;
    }>;
    findSent(userId: string): Promise<({
        targetProperty: ({
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
        }) | null;
        targetSeekerProfile: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.SeekerType;
            preferredCity: string;
            preferredLat: number | null;
            preferredLng: number | null;
            budgetMin: number;
            budgetMax: number;
            moveInDate: Date;
            bio: string | null;
            isPublic: boolean;
            sleepSchedule: string | null;
            cleanliness: string | null;
            smoking: string | null;
            pets: string | null;
            workFromHome: boolean | null;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            occupation: string | null;
            age: number | null;
            userId: string;
        }) | null;
        chatRoom: {
            id: string;
            createdAt: Date;
            interestId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InterestStatus;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
        respondedAt: Date | null;
        fromUserId: string;
    })[]>;
    findReceived(userId: string): Promise<({
        targetProperty: ({
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
        }) | null;
        targetSeekerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.SeekerType;
            preferredCity: string;
            preferredLat: number | null;
            preferredLng: number | null;
            budgetMin: number;
            budgetMax: number;
            moveInDate: Date;
            bio: string | null;
            isPublic: boolean;
            sleepSchedule: string | null;
            cleanliness: string | null;
            smoking: string | null;
            pets: string | null;
            workFromHome: boolean | null;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            occupation: string | null;
            age: number | null;
            userId: string;
        } | null;
        fromUser: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
        };
        chatRoom: {
            id: string;
            createdAt: Date;
            interestId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InterestStatus;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
        respondedAt: Date | null;
        fromUserId: string;
    })[]>;
    accept(id: string, userId: string): Promise<{
        targetProperty: ({
            owner: {
                id: string;
                name: string;
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
        }) | null;
        targetSeekerProfile: ({
            user: {
                id: string;
                email: string;
                passwordHash: string;
                name: string;
                phone: string | null;
                avatarUrl: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                emailVerified: boolean;
                emailVerifyToken: string | null;
                phoneVerified: boolean;
                lastSeenAt: Date | null;
                notificationPrefs: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.SeekerType;
            preferredCity: string;
            preferredLat: number | null;
            preferredLng: number | null;
            budgetMin: number;
            budgetMax: number;
            moveInDate: Date;
            bio: string | null;
            isPublic: boolean;
            sleepSchedule: string | null;
            cleanliness: string | null;
            smoking: string | null;
            pets: string | null;
            workFromHome: boolean | null;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            occupation: string | null;
            age: number | null;
            userId: string;
        }) | null;
        fromUser: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InterestStatus;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
        respondedAt: Date | null;
        fromUserId: string;
    }>;
    decline(id: string, userId: string): Promise<{
        targetProperty: {
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
        } | null;
        targetSeekerProfile: ({
            user: {
                id: string;
                email: string;
                passwordHash: string;
                name: string;
                phone: string | null;
                avatarUrl: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                emailVerified: boolean;
                emailVerifyToken: string | null;
                phoneVerified: boolean;
                lastSeenAt: Date | null;
                notificationPrefs: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.SeekerType;
            preferredCity: string;
            preferredLat: number | null;
            preferredLng: number | null;
            budgetMin: number;
            budgetMax: number;
            moveInDate: Date;
            bio: string | null;
            isPublic: boolean;
            sleepSchedule: string | null;
            cleanliness: string | null;
            smoking: string | null;
            pets: string | null;
            workFromHome: boolean | null;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            occupation: string | null;
            age: number | null;
            userId: string;
        }) | null;
        fromUser: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InterestStatus;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetPropertyId: string | null;
        targetSeekerProfileId: string | null;
        respondedAt: Date | null;
        fromUserId: string;
    }>;
}
