"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeekerQueryDto = exports.UpdateSeekerProfileDto = exports.CreateSeekerProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class CreateSeekerProfileDto {
    type;
    preferredCity;
    preferredLat;
    preferredLng;
    budgetMin;
    budgetMax;
    moveInDate;
    bio;
    isPublic;
    sleepSchedule;
    cleanliness;
    smoking;
    pets;
    workFromHome;
    genderPreference;
    occupation;
    age;
}
exports.CreateSeekerProfileDto = CreateSeekerProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeekerType, example: 'ROOM_SEEKER' }),
    (0, class_validator_1.IsEnum)(client_1.SeekerType),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bangalore' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "preferredCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12.935 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSeekerProfileDto.prototype, "preferredLat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.624 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSeekerProfileDto.prototype, "preferredLng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSeekerProfileDto.prototype, "budgetMin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSeekerProfileDto.prototype, "budgetMax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "moveInDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Software dev, early riser, clean habits' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSeekerProfileDto.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['early_bird', 'night_owl', 'flexible'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "sleepSchedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['very_clean', 'moderate', 'relaxed'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "cleanliness", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['smoker', 'non_smoker', 'outdoors_only'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "smoking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['has_pets', 'no_pets', 'pet_friendly'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "pets", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSeekerProfileDto.prototype, "workFromHome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.GenderPreference }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.GenderPreference),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "genderPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Software Engineer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeekerProfileDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 25 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateSeekerProfileDto.prototype, "age", void 0);
class UpdateSeekerProfileDto {
    type;
    preferredCity;
    preferredLat;
    preferredLng;
    budgetMin;
    budgetMax;
    moveInDate;
    bio;
    isPublic;
    sleepSchedule;
    cleanliness;
    smoking;
    pets;
    workFromHome;
    genderPreference;
    occupation;
    age;
}
exports.UpdateSeekerProfileDto = UpdateSeekerProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SeekerType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SeekerType),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "preferredCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSeekerProfileDto.prototype, "preferredLat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSeekerProfileDto.prototype, "preferredLng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateSeekerProfileDto.prototype, "budgetMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateSeekerProfileDto.prototype, "budgetMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "moveInDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSeekerProfileDto.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "sleepSchedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "cleanliness", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "smoking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "pets", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSeekerProfileDto.prototype, "workFromHome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.GenderPreference }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.GenderPreference),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "genderPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeekerProfileDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateSeekerProfileDto.prototype, "age", void 0);
class SeekerQueryDto {
    city;
    minBudget;
    maxBudget;
    type;
    genderPreference;
    lat;
    lng;
    radiusKm;
    page;
    limit;
}
exports.SeekerQueryDto = SeekerQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeekerQueryDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "minBudget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "maxBudget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SeekerType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SeekerType),
    __metadata("design:type", String)
], SeekerQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.GenderPreference }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.GenderPreference),
    __metadata("design:type", String)
], SeekerQueryDto.prototype, "genderPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "radiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], SeekerQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=seeker-profile.dto.js.map