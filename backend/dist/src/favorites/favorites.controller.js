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
exports.FavoritesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let FavoritesController = class FavoritesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async toggle(propertyId, userId) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });
        if (existing) {
            await this.prisma.favorite.delete({
                where: { id: existing.id },
            });
            return { favorited: false };
        }
        await this.prisma.favorite.create({
            data: { userId, propertyId },
        });
        return { favorited: true };
    }
    async findAll(userId) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            include: {
                property: {
                    include: {
                        photos: { orderBy: { order: 'asc' }, take: 1 },
                        owner: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return favorites;
    }
};
exports.FavoritesController = FavoritesController;
__decorate([
    (0, common_1.Post)(':propertyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle favorite on a property' }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get saved/favorited listings' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findAll", null);
exports.FavoritesController = FavoritesController = __decorate([
    (0, swagger_1.ApiTags)('Favorites'),
    (0, common_1.Controller)('favorites'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.TENANT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], FavoritesController);
//# sourceMappingURL=favorites.controller.js.map