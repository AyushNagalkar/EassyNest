import {
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, FurnishingStatus, GenderPreference } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Spacious 1BHK in Koramangala' })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 'Well-ventilated apartment with balcony...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  city: string;

  @ApiProperty({ example: '4th Cross, Koramangala 5th Block' })
  @IsString()
  address: string;

  @ApiProperty({ example: 12.935 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 77.624 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  rent: number;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  availableFrom: string;

  @ApiProperty({ enum: RoomType, example: 'ONE_BHK' })
  @IsEnum(RoomType)
  roomType: RoomType;

  @ApiProperty({ enum: FurnishingStatus, example: 'SEMI_FURNISHED' })
  @IsEnum(FurnishingStatus)
  furnishing: FurnishingStatus;

  @ApiPropertyOptional({ example: ['wifi', 'parking', 'gym'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ example: ['no_smoking', 'vegetarian'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({ enum: GenderPreference, example: 'ANY' })
  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  leaseLengthMonths?: number;
}

export class UpdatePropertyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional({ enum: RoomType })
  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishing?: FurnishingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({ enum: GenderPreference })
  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  leaseLengthMonths?: number;
}

export class PropertyQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minRent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxRent?: number;

  @ApiPropertyOptional({ enum: RoomType })
  @IsOptional()
  @IsString()
  roomType?: string; // comma-separated for multi-select: "SINGLE_ROOM,ONE_BHK"

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishing?: FurnishingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amenities?: string; // comma-separated: "wifi,parking"

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  petFriendly?: boolean;

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

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;

  @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'recency', 'score'] })
  @IsOptional()
  @IsString()
  sortBy?: string;

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

export class UpdateStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'FILLED', 'INACTIVE'] })
  @IsEnum({ ACTIVE: 'ACTIVE', FILLED: 'FILLED', INACTIVE: 'INACTIVE' })
  status: 'ACTIVE' | 'FILLED' | 'INACTIVE';
}

export class ReorderPhotosDto {
  @ApiProperty({ example: [{ id: 'photo1', order: 0 }, { id: 'photo2', order: 1 }] })
  @IsArray()
  photos: { id: string; order: number }[];
}
