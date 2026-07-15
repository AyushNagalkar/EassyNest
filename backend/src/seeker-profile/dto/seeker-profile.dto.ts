import {
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeekerType, GenderPreference } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSeekerProfileDto {
  @ApiProperty({ enum: SeekerType, example: 'ROOM_SEEKER' })
  @IsEnum(SeekerType)
  type: SeekerType;

  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  preferredCity: string;

  @ApiPropertyOptional({ example: 12.935 })
  @IsOptional()
  @IsNumber()
  preferredLat?: number;

  @ApiPropertyOptional({ example: 77.624 })
  @IsOptional()
  @IsNumber()
  preferredLng?: number;

  @ApiProperty({ example: 8000 })
  @IsInt()
  @Min(0)
  budgetMin: number;

  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  budgetMax: number;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  moveInDate: string;

  @ApiPropertyOptional({ example: 'Software dev, early riser, clean habits' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  bio?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  // Lifestyle fields
  @ApiPropertyOptional({ enum: ['early_bird', 'night_owl', 'flexible'] })
  @IsOptional()
  @IsString()
  sleepSchedule?: string;

  @ApiPropertyOptional({ enum: ['very_clean', 'moderate', 'relaxed'] })
  @IsOptional()
  @IsString()
  cleanliness?: string;

  @ApiPropertyOptional({ enum: ['smoker', 'non_smoker', 'outdoors_only'] })
  @IsOptional()
  @IsString()
  smoking?: string;

  @ApiPropertyOptional({ enum: ['has_pets', 'no_pets', 'pet_friendly'] })
  @IsOptional()
  @IsString()
  pets?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  workFromHome?: boolean;

  @ApiPropertyOptional({ enum: GenderPreference })
  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;
}

export class UpdateSeekerProfileDto {
  @ApiPropertyOptional({ enum: SeekerType })
  @IsOptional()
  @IsEnum(SeekerType)
  type?: SeekerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preferredLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preferredLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sleepSchedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cleanliness?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smoking?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pets?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  workFromHome?: boolean;

  @ApiPropertyOptional({ enum: GenderPreference })
  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;
}

export class SeekerQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxBudget?: number;

  @ApiPropertyOptional({ enum: SeekerType })
  @IsOptional()
  @IsEnum(SeekerType)
  type?: SeekerType;

  @ApiPropertyOptional({ enum: GenderPreference })
  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
