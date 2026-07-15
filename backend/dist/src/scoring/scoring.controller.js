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
exports.ScoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scoring_service_js_1 = require("./scoring.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const common_2 = require("@nestjs/common");
let ScoringController = class ScoringController {
    scoringService;
    prisma;
    constructor(scoringService, prisma) {
        this.scoringService = scoringService;
        this.prisma = prisma;
    }
    async scoreProperty(userId, propertyId) {
        const seekerProfile = await this.prisma.seekerProfile.findUnique({
            where: { userId },
        });
        if (!seekerProfile) {
            throw new common_2.NotFoundException('Create a seeker profile first');
        }
        return this.scoringService.scoreProperty(seekerProfile.id, propertyId);
    }
    async scoreSeeker(userId, seekerProfileId) {
        const seekerProfile = await this.prisma.seekerProfile.findUnique({
            where: { userId },
        });
        if (!seekerProfile) {
            throw new common_2.NotFoundException('Create a seeker profile first');
        }
        return this.scoringService.scoreSeeker(seekerProfile.id, seekerProfileId);
    }
    async getScore(id) {
        return this.scoringService.getScore(id);
    }
};
exports.ScoringController = ScoringController;
__decorate([
    (0, common_1.Post)('property/:propertyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger scoring for a property (returns cached or queues job)' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "scoreProperty", null);
__decorate([
    (0, common_1.Post)('seeker/:seekerProfileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger scoring for flatmate matching' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('seekerProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "scoreSeeker", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific score by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "getScore", null);
exports.ScoringController = ScoringController = __decorate([
    (0, swagger_1.ApiTags)('Compatibility Scoring'),
    (0, common_1.Controller)('scores'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(client_1.Role.TENANT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [scoring_service_js_1.ScoringService,
        prisma_service_js_1.PrismaService])
], ScoringController);
//# sourceMappingURL=scoring.controller.js.map