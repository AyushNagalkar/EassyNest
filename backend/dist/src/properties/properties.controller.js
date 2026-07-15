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
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const properties_service_js_1 = require("./properties.service.js");
const property_dto_js_1 = require("./dto/property.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const optional_jwt_auth_guard_js_1 = require("../auth/guards/optional-jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let PropertiesController = class PropertiesController {
    propertiesService;
    prisma;
    constructor(propertiesService, prisma) {
        this.propertiesService = propertiesService;
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.propertiesService.create(userId, dto);
    }
    async findMine(userId) {
        return this.propertiesService.findMine(userId);
    }
    async getAnalytics(userId) {
        return this.propertiesService.getAnalytics(userId);
    }
    async browse(query, req) {
        const user = req.user;
        let seekerProfileId;
        if (user?.role === 'TENANT') {
            const profile = await this.prisma.seekerProfile.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });
            seekerProfileId = profile?.id;
        }
        return this.propertiesService.browse(query, seekerProfileId);
    }
    async findOne(id, req) {
        const viewerIp = req.headers['x-forwarded-for'] || req.ip;
        const viewerId = req.user?.id;
        return this.propertiesService.findById(id, viewerIp, viewerId);
    }
    async update(id, userId, dto) {
        return this.propertiesService.update(id, userId, dto);
    }
    async updateStatus(id, userId, dto) {
        return this.propertiesService.updateStatus(id, userId, dto.status);
    }
    async reorderPhotos(id, userId, dto) {
        return this.propertiesService.reorderPhotos(id, userId, dto.photos);
    }
    async remove(id, userId) {
        return this.propertiesService.remove(id, userId);
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new property listing' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, property_dto_js_1.CreatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get owner's own listings" }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('mine/analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics for owned properties' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_js_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Browse properties with filters (optional auth for compatibility scores)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [property_dto_js_1.PropertyQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "browse", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get property details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a property listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, property_dto_js_1.UpdatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update property status (ACTIVE/FILLED/INACTIVE)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, property_dto_js_1.UpdateStatusDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/photos/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder property photos' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, property_dto_js_1.ReorderPhotosDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "reorderPhotos", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.OWNER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a property listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "remove", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, swagger_1.ApiTags)('Properties'),
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_js_1.PropertiesService,
        prisma_service_js_1.PrismaService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map