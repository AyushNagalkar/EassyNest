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
exports.SeekerProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seeker_profile_service_js_1 = require("./seeker-profile.service.js");
const seeker_profile_dto_js_1 = require("./dto/seeker-profile.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const client_1 = require("@prisma/client");
let SeekerProfileController = class SeekerProfileController {
    seekerProfileService;
    constructor(seekerProfileService) {
        this.seekerProfileService = seekerProfileService;
    }
    async create(userId, dto) {
        return this.seekerProfileService.create(userId, dto);
    }
    async findMine(userId) {
        return this.seekerProfileService.findMine(userId);
    }
    async update(userId, dto) {
        return this.seekerProfileService.update(userId, dto);
    }
    async browse(query) {
        return this.seekerProfileService.browse(query);
    }
    async findOne(id) {
        return this.seekerProfileService.findById(id);
    }
};
exports.SeekerProfileController = SeekerProfileController;
__decorate([
    (0, common_1.Post)('seeker-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.TENANT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create seeker profile' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seeker_profile_dto_js_1.CreateSeekerProfileDto]),
    __metadata("design:returntype", Promise)
], SeekerProfileController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('seeker-profile/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.TENANT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get own seeker profile' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeekerProfileController.prototype, "findMine", null);
__decorate([
    (0, common_1.Patch)('seeker-profile/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.TENANT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update own seeker profile' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seeker_profile_dto_js_1.UpdateSeekerProfileDto]),
    __metadata("design:returntype", Promise)
], SeekerProfileController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('seekers'),
    (0, swagger_1.ApiOperation)({ summary: 'Browse public flatmate-seeker profiles' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seeker_profile_dto_js_1.SeekerQueryDto]),
    __metadata("design:returntype", Promise)
], SeekerProfileController.prototype, "browse", null);
__decorate([
    (0, common_1.Get)('seekers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seeker profile details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeekerProfileController.prototype, "findOne", null);
exports.SeekerProfileController = SeekerProfileController = __decorate([
    (0, swagger_1.ApiTags)('Seeker Profile'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [seeker_profile_service_js_1.SeekerProfileService])
], SeekerProfileController);
//# sourceMappingURL=seeker-profile.controller.js.map