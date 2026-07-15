"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const properties_module_js_1 = require("./properties/properties.module.js");
const seeker_profile_module_js_1 = require("./seeker-profile/seeker-profile.module.js");
const scoring_module_js_1 = require("./scoring/scoring.module.js");
const interests_module_js_1 = require("./interests/interests.module.js");
const chat_module_js_1 = require("./chat/chat.module.js");
const notifications_module_js_1 = require("./notifications/notifications.module.js");
const email_module_js_1 = require("./email/email.module.js");
const upload_module_js_1 = require("./upload/upload.module.js");
const favorites_module_js_1 = require("./favorites/favorites.module.js");
const admin_module_js_1 = require("./admin/admin.module.js");
const saved_searches_module_js_1 = require("./saved-searches/saved-searches.module.js");
const reviews_module_js_1 = require("./reviews/reviews.module.js");
const flags_module_js_1 = require("./flags/flags.module.js");
const configuration_js_1 = __importDefault(require("./config/configuration.js"));
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_js_1.default],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_js_1.PrismaModule,
            auth_module_js_1.AuthModule,
            properties_module_js_1.PropertiesModule,
            seeker_profile_module_js_1.SeekerProfileModule,
            scoring_module_js_1.ScoringModule,
            interests_module_js_1.InterestsModule,
            chat_module_js_1.ChatModule,
            notifications_module_js_1.NotificationsModule,
            email_module_js_1.EmailModule,
            upload_module_js_1.UploadModule,
            favorites_module_js_1.FavoritesModule,
            admin_module_js_1.AdminModule,
            saved_searches_module_js_1.SavedSearchesModule,
            reviews_module_js_1.ReviewsModule,
            flags_module_js_1.FlagsModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [app_service_js_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map