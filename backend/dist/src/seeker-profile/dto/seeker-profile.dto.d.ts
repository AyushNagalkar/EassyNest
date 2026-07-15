import { SeekerType, GenderPreference } from '@prisma/client';
export declare class CreateSeekerProfileDto {
    type: SeekerType;
    preferredCity: string;
    preferredLat?: number;
    preferredLng?: number;
    budgetMin: number;
    budgetMax: number;
    moveInDate: string;
    bio?: string;
    isPublic?: boolean;
    sleepSchedule?: string;
    cleanliness?: string;
    smoking?: string;
    pets?: string;
    workFromHome?: boolean;
    genderPreference?: GenderPreference;
    occupation?: string;
    age?: number;
}
export declare class UpdateSeekerProfileDto {
    type?: SeekerType;
    preferredCity?: string;
    preferredLat?: number;
    preferredLng?: number;
    budgetMin?: number;
    budgetMax?: number;
    moveInDate?: string;
    bio?: string;
    isPublic?: boolean;
    sleepSchedule?: string;
    cleanliness?: string;
    smoking?: string;
    pets?: string;
    workFromHome?: boolean;
    genderPreference?: GenderPreference;
    occupation?: string;
    age?: number;
}
export declare class SeekerQueryDto {
    city?: string;
    minBudget?: number;
    maxBudget?: number;
    type?: SeekerType;
    genderPreference?: GenderPreference;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
}
