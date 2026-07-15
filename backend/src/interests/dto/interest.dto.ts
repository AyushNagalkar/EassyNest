import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TargetType } from '@prisma/client';

export class CreateInterestDto {
  @ApiProperty({ enum: TargetType })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetPropertyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetSeekerProfileId?: string;
}
