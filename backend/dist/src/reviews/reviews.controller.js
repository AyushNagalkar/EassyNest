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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
class CreateReviewDto {
    interestId;
    rating;
    comment;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "interestId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
let ReviewsController = class ReviewsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(authorId, dto) {
        const interest = await this.prisma.interest.findUnique({
            where: { id: dto.interestId },
            include: {
                targetProperty: { select: { ownerId: true } },
                targetSeekerProfile: { select: { userId: true } },
            },
        });
        if (!interest)
            throw new common_1.NotFoundException('Interest not found');
        if (interest.status !== 'ACCEPTED') {
            throw new common_1.BadRequestException('Can only review after an accepted interest');
        }
        let targetId;
        if (interest.fromUserId === authorId) {
            targetId = interest.targetProperty?.ownerId || interest.targetSeekerProfile?.userId || '';
        }
        else {
            targetId = interest.fromUserId;
        }
        if (!targetId || targetId === authorId) {
            throw new common_1.BadRequestException('Cannot review yourself');
        }
        return this.prisma.review.create({
            data: {
                authorId,
                targetId,
                interestId: dto.interestId,
                rating: dto.rating,
                comment: dto.comment,
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
    }
    async findForUser(userId) {
        const reviews = await this.prisma.review.findMany({
            where: { targetId: userId },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;
        return {
            reviews,
            averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
            totalReviews: reviews.length,
        };
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a review for a user after an accepted interest' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reviews for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findForUser", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('Reviews'),
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map