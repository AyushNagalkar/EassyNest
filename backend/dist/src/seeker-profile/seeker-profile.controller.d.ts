import { SeekerProfileService } from './seeker-profile.service.js';
import { CreateSeekerProfileDto, UpdateSeekerProfileDto, SeekerQueryDto } from './dto/seeker-profile.dto.js';
export declare class SeekerProfileController {
    private seekerProfileService;
    constructor(seekerProfileService: SeekerProfileService);
    create(userId: string, dto: CreateSeekerProfileDto): Promise<{
        user: {
            id: string;
            name: string;
            avatarUrl: string | null;
            emailVerified: boolean;
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
    }>;
    findMine(userId: string): Promise<{
        user: {
            id: string;
            name: string;
            avatarUrl: string | null;
            emailVerified: boolean;
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
    }>;
    update(userId: string, dto: UpdateSeekerProfileDto): Promise<{
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
    }>;
    browse(query: SeekerQueryDto): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
                emailVerified: boolean;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
            avatarUrl: string | null;
            emailVerified: boolean;
            createdAt: Date;
            _count: {
                reviewsReceived: number;
            };
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
    }>;
}
