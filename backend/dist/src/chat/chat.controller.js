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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_js_1 = require("./chat.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getUnreadCounts(userId) {
        return this.chatService.getUnreadCounts(userId);
    }
    async getMessages(interestId, userId, page, limit) {
        return this.chatService.getMessages(interestId, userId, page || 1, limit || 50);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('unread-counts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread message counts per chat room' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCounts", null);
__decorate([
    (0, common_1.Get)(':interestId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated chat message history' }),
    __param(0, (0, common_1.Param)('interestId')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [chat_service_js_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map