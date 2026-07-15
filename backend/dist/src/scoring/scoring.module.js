"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const scoring_controller_js_1 = require("./scoring.controller.js");
const scoring_service_js_1 = require("./scoring.service.js");
const scoring_processor_js_1 = require("./scoring.processor.js");
let ScoringModule = class ScoringModule {
};
exports.ScoringModule = ScoringModule;
exports.ScoringModule = ScoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                useFactory: (configService) => {
                    const redisUrl = configService.get('redis.url') || '';
                    if (!redisUrl) {
                        return { connection: { host: 'localhost', port: 6379 } };
                    }
                    const url = new URL(redisUrl);
                    return {
                        connection: {
                            host: url.hostname,
                            port: parseInt(url.port) || 6379,
                            password: url.password,
                            tls: url.protocol === 'rediss:' ? {} : undefined,
                            maxRetriesPerRequest: null,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({ name: 'scoring' }),
            bullmq_1.BullModule.registerQueue({ name: 'email' }),
        ],
        controllers: [scoring_controller_js_1.ScoringController],
        providers: [scoring_service_js_1.ScoringService, scoring_processor_js_1.ScoringProcessor],
        exports: [scoring_service_js_1.ScoringService, bullmq_1.BullModule],
    })
], ScoringModule);
//# sourceMappingURL=scoring.module.js.map