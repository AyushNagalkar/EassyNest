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
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const scoring_fallback_js_1 = require("./scoring.fallback.js");
let ScoringService = class ScoringService {
    prisma;
    scoringQueue;
    constructor(prisma, scoringQueue) {
        this.prisma = prisma;
        this.scoringQueue = scoringQueue;
    }
    async runWithTimeout(promise, timeoutMs = 2500) {
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Redis/Queue connection timeout'));
            }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => {
            clearTimeout(timeoutId);
        });
    }
    async scoreProperty(seekerProfileId, propertyId) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        const existing = await this.prisma.compatibilityScore.findFirst({
            where: {
                seekerProfileId,
                targetType: 'PROPERTY',
                targetPropertyId: propertyId,
            },
        });
        if (existing) {
            return { status: 'cached', score: existing };
        }
        try {
            const job = await this.runWithTimeout(this.scoringQueue.add('score', {
                seekerProfileId,
                targetType: 'PROPERTY',
                targetPropertyId: propertyId,
            }, {
                attempts: 2,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: true,
                removeOnFail: false,
            }));
            return { status: 'queued', jobId: job.id };
        }
        catch (error) {
            console.warn(`Scoring queue failed for property ${propertyId}, running synchronous fallback: ${error.message}`);
            const seeker = await this.prisma.seekerProfile.findUnique({
                where: { id: seekerProfileId },
            });
            if (!seeker)
                throw new common_1.NotFoundException('Seeker profile not found');
            const { score, explanation } = (0, scoring_fallback_js_1.scoreSeekerVsProperty)(seeker, property);
            let cachedScore = await this.prisma.compatibilityScore.findFirst({
                where: {
                    seekerProfileId,
                    targetType: 'PROPERTY',
                    targetPropertyId: propertyId,
                    targetSeekerProfileId: null,
                },
            });
            if (cachedScore) {
                cachedScore = await this.prisma.compatibilityScore.update({
                    where: { id: cachedScore.id },
                    data: { score, explanation, source: 'RULE_BASED' },
                });
            }
            else {
                cachedScore = await this.prisma.compatibilityScore.create({
                    data: {
                        seekerProfileId,
                        targetType: 'PROPERTY',
                        targetPropertyId: propertyId,
                        score,
                        explanation,
                        source: 'RULE_BASED',
                    },
                });
            }
            return { status: 'cached', score: cachedScore };
        }
    }
    async scoreSeeker(seekerProfileId, targetSeekerProfileId) {
        const target = await this.prisma.seekerProfile.findUnique({
            where: { id: targetSeekerProfileId },
        });
        if (!target)
            throw new common_1.NotFoundException('Target seeker profile not found');
        const existing = await this.prisma.compatibilityScore.findFirst({
            where: {
                seekerProfileId,
                targetType: 'SEEKER_PROFILE',
                targetSeekerProfileId,
            },
        });
        if (existing) {
            return { status: 'cached', score: existing };
        }
        try {
            const job = await this.runWithTimeout(this.scoringQueue.add('score', {
                seekerProfileId,
                targetType: 'SEEKER_PROFILE',
                targetSeekerProfileId,
            }, {
                attempts: 2,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: true,
                removeOnFail: false,
            }));
            return { status: 'queued', jobId: job.id };
        }
        catch (error) {
            console.warn(`Scoring queue failed for flatmate match ${targetSeekerProfileId}, running synchronous fallback: ${error.message}`);
            const seekerA = await this.prisma.seekerProfile.findUnique({
                where: { id: seekerProfileId },
            });
            if (!seekerA)
                throw new common_1.NotFoundException('Seeker profile not found');
            const { score, explanation } = (0, scoring_fallback_js_1.scoreSeekerVsSeeker)(seekerA, target);
            let cachedScore = await this.prisma.compatibilityScore.findFirst({
                where: {
                    seekerProfileId,
                    targetType: 'SEEKER_PROFILE',
                    targetSeekerProfileId,
                    targetPropertyId: null,
                },
            });
            if (cachedScore) {
                cachedScore = await this.prisma.compatibilityScore.update({
                    where: { id: cachedScore.id },
                    data: { score, explanation, source: 'RULE_BASED' },
                });
            }
            else {
                cachedScore = await this.prisma.compatibilityScore.create({
                    data: {
                        seekerProfileId,
                        targetType: 'SEEKER_PROFILE',
                        targetSeekerProfileId,
                        score,
                        explanation,
                        source: 'RULE_BASED',
                    },
                });
            }
            return { status: 'cached', score: cachedScore };
        }
    }
    async getScore(id) {
        const score = await this.prisma.compatibilityScore.findUnique({
            where: { id },
        });
        if (!score)
            throw new common_1.NotFoundException('Score not found');
        return score;
    }
    async getPropertyScore(seekerProfileId, propertyId) {
        const score = await this.prisma.compatibilityScore.findFirst({
            where: {
                seekerProfileId,
                targetType: 'PROPERTY',
                targetPropertyId: propertyId,
            },
        });
        return score;
    }
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('scoring')),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        bullmq_2.Queue])
], ScoringService);
//# sourceMappingURL=scoring.service.js.map