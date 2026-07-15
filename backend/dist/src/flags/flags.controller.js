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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
class CreateFlagDto {
    targetType;
    targetId;
    reason;
    details;
    propertyId;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlagDto.prototype, "targetType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlagDto.prototype, "targetId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.FlagReason),
    __metadata("design:type", String)
], CreateFlagDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlagDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlagDto.prototype, "propertyId", void 0);
let FlagsController = class FlagsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.flag.create({
            data: {
                creatorId: userId,
                targetType: dto.targetType,
                targetId: dto.targetId,
                reason: dto.reason,
                details: dto.details,
                propertyId: dto.propertyId,
            },
        });
    }
};
exports.FlagsController = FlagsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Flag content for moderation' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateFlagDto]),
    __metadata("design:returntype", Promise)
], FlagsController.prototype, "create", null);
exports.FlagsController = FlagsController = __decorate([
    (0, swagger_1.ApiTags)('Flags'),
    (0, common_1.Controller)('flags'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], FlagsController);
//# sourceMappingURL=flags.controller.js.map