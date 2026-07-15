import { TargetType } from '@prisma/client';
export declare class CreateInterestDto {
    targetType: TargetType;
    targetPropertyId?: string;
    targetSeekerProfileId?: string;
}
