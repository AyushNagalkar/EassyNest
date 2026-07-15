import { SeekerProfile, Property } from '@prisma/client';
export declare function buildSystemPrompt(): string;
export declare function buildPropertyScoringPrompt(seeker: SeekerProfile, property: Property & {
    amenities?: string[];
    rules?: string[];
}): string;
export declare function buildSeekerScoringPrompt(a: SeekerProfile, b: SeekerProfile): string;
