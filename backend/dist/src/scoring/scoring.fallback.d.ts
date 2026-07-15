import { SeekerProfile, Property } from '@prisma/client';
interface ScoreResult {
    score: number;
    explanation: string;
}
export declare function scoreSeekerVsProperty(seeker: SeekerProfile, property: Property & {
    amenities?: string[];
    rules?: string[];
}): ScoreResult;
export declare function scoreSeekerVsSeeker(a: SeekerProfile, b: SeekerProfile): ScoreResult;
export {};
