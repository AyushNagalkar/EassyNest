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
exports.InterestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const interests_service_js_1 = require("./interests.service.js");
const interest_dto_js_1 = require("./dto/interest.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const client_1 = require("@prisma/client");
let InterestsController = class InterestsController {
    interestsService;
    constructor(interestsService) {
        this.interestsService = interestsService;
    }
    async create(userId, dto) {
        return this.interestsService.create(userId, dto);
    }
    async findSent(userId) {
        return this.interestsService.findSent(userId);
    }
    async findReceived(userId) {
        return this.interestsService.findReceived(userId);
    }
    async accept(id, userId) {
        return this.interestsService.accept(id, userId);
    }
    async decline(id, userId) {
        return this.interestsService.decline(id, userId);
    }
};
exports.InterestsController = InterestsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.TENANT),
    (0, swagger_1.ApiOperation)({ summary: 'Express interest in a property or seeker profile' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, interest_dto_js_1.CreateInterestDto]),
    __metadata("design:returntype", Promise)
], InterestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('sent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interests sent by this user' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterestsController.prototype, "findSent", null);
__decorate([
    (0, common_1.Get)('received'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interests received (for properties owned or seeker profile)' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterestsController.prototype, "findReceived", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an interest (creates ChatRoom)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterestsController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/decline'),
    (0, swagger_1.ApiOperation)({ summary: 'Decline an interest' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterestsController.prototype, "decline", null);
exports.InterestsController = InterestsController = __decorate([
    (0, swagger_1.ApiTags)('Interests'),
    (0, common_1.Controller)('interests'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [interests_service_js_1.InterestsService])
], InterestsController);
//# sourceMappingURL=interests.controller.js.map