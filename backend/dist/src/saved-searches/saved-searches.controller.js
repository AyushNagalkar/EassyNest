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
exports.SavedSearchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
class CreateSavedSearchDto {
    name;
    filters;
    alertsOn;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateSavedSearchDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSavedSearchDto.prototype, "alertsOn", void 0);
let SavedSearchesController = class SavedSearchesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.savedSearch.create({
            data: {
                userId,
                name: dto.name,
                filters: dto.filters,
                alertsOn: dto.alertsOn ?? true,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id, userId) {
        await this.prisma.savedSearch.deleteMany({
            where: { id, userId },
        });
        return { message: 'Saved search deleted' };
    }
};
exports.SavedSearchesController = SavedSearchesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a saved search with optional alerts' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateSavedSearchDto]),
    __metadata("design:returntype", Promise)
], SavedSearchesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all saved searches' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SavedSearchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved search' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SavedSearchesController.prototype, "remove", null);
exports.SavedSearchesController = SavedSearchesController = __decorate([
    (0, swagger_1.ApiTags)('Saved Searches'),
    (0, common_1.Controller)('saved-searches'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SavedSearchesController);
//# sourceMappingURL=saved-searches.controller.js.map