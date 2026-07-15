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
exports.ReorderPhotosDto = exports.UpdateStatusDto = exports.PropertyQueryDto = exports.UpdatePropertyDto = exports.CreatePropertyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class CreatePropertyDto {
    title;
    description;
    city;
    address;
    lat;
    lng;
    rent;
    availableFrom;
    roomType;
    furnishing;
    amenities;
    rules;
    petFriendly;
    genderPreference;
    leaseLengthMonths;
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Spacious 1BHK in Koramangala' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Well-ventilated apartment with balcony...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bangalore' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '4th Cross, Koramangala 5th Block' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12.935 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 77.624 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "rent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RoomType, example: 'ONE_BHK' }),
    (0, class_validator_1.IsEnum)(client_1.RoomType),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "roomType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.FurnishingStatus, example: 'SEMI_FURNISHED' }),
    (0, class_validator_1.IsEnum)(client_1.FurnishingStatus),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "furnishing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['wifi', 'parking', 'gym'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['no_smoking', 'vegetarian'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePropertyDto.prototype, "petFriendly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.GenderPreference, example: 'ANY' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.GenderPreference),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "genderPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "leaseLengthMonths", void 0);
class UpdatePropertyDto {
    title;
    description;
    city;
    address;
    lat;
    lng;
    rent;
    availableFrom;
    roomType;
    furnishing;
    amenities;
    rules;
    petFriendly;
    genderPreference;
    leaseLengthMonths;
}
exports.UpdatePropertyDto = UpdatePropertyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "rent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RoomType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RoomType),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "roomType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.FurnishingStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FurnishingStatus),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "furnishing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePropertyDto.prototype, "petFriendly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.GenderPreference }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.GenderPreference),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "genderPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "leaseLengthMonths", void 0);
class PropertyQueryDto {
    city;
    minRent;
    maxRent;
    roomType;
    furnishing;
    amenities;
    petFriendly;
    genderPreference;
    lat;
    lng;
    radiusKm;
    sortBy;
    page;
    limit;
}
exports.PropertyQueryDto = PropertyQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyQueryDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "minRent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "maxRent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RoomType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyQueryDto.prototype, "roomType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.FurnishingStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FurnishingStatus),
    __metadata("design:type", String)
], PropertyQueryDto.prototype, "furnishing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyQueryDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyQueryDto.prototype, "petFriendly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.GenderPreference }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.GenderPreference),
    __metadata("design:type", String)
], PropertyQueryDto.prototype, "genderPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "radiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['price_asc', 'price_desc', 'recency', 'score'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], PropertyQueryDto.prototype, "limit", void 0);
class UpdateStatusDto {
    status;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ACTIVE', 'FILLED', 'INACTIVE'] }),
    (0, class_validator_1.IsEnum)({ ACTIVE: 'ACTIVE', FILLED: 'FILLED', INACTIVE: 'INACTIVE' }),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
class ReorderPhotosDto {
    photos;
}
exports.ReorderPhotosDto = ReorderPhotosDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: [{ id: 'photo1', order: 0 }, { id: 'photo2', order: 1 }] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ReorderPhotosDto.prototype, "photos", void 0);
//# sourceMappingURL=property.dto.js.map