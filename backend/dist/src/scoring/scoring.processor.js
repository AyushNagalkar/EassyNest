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
var ScoringProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const scoring_prompts_js_1 = require("./scoring.prompts.js");
const scoring_fallback_js_1 = require("./scoring.fallback.js");
let ScoringProcessor = ScoringProcessor_1 = class ScoringProcessor extends bullmq_1.WorkerHost {
    prisma;
    configService;
    logger = new common_1.Logger(ScoringProcessor_1.name);
    geminiApiKey;
    geminiModel;
    timeoutMs;
    constructor(prisma, configService) {
        super();
        this.prisma = prisma;
        this.configService = configService;
        this.geminiApiKey = this.configService.get('gemini.apiKey') || '';
        this.geminiModel = this.configService.get('gemini.model') || 'gemini-2.5-flash';
        this.timeoutMs = this.configService.get('gemini.timeoutMs') || 8000;
    }
    async process(job) {
        const { seekerProfileId, targetType, targetPropertyId, targetSeekerProfileId } = job.data;
        this.logger.log(`Processing scoring job ${job.id}: seeker=${seekerProfileId} target=${targetType}`);
        const existing = await this.prisma.compatibilityScore.findFirst({
            where: {
                seekerProfileId,
                targetType,
                targetPropertyId: targetPropertyId || null,
                targetSeekerProfileId: targetSeekerProfileId || null,
            },
        });
        if (existing) {
            this.logger.log(`Score already exists: ${existing.id}`);
            return existing;
        }
        const seeker = await this.prisma.seekerProfile.findUnique({
            where: { id: seekerProfileId },
        });
        if (!seeker) {
            throw new Error(`Seeker profile ${seekerProfileId} not found`);
        }
        let score;
        let explanation;
        let source = 'LLM';
        try {
            const llmResult = await this.callGemini(seeker, targetType, targetPropertyId, targetSeekerProfileId);
            score = llmResult.score;
            explanation = llmResult.explanation;
        }
        catch (error) {
            this.logger.warn(`LLM scoring failed, using fallback: ${error}`);
            const fallbackResult = await this.runFallback(seeker, targetType, targetPropertyId, targetSeekerProfileId);
            score = fallbackResult.score;
            explanation = fallbackResult.explanation;
            source = 'RULE_BASED';
        }
        const result = await this.prisma.compatibilityScore.create({
            data: {
                seekerProfileId,
                targetType,
                targetPropertyId: targetPropertyId || null,
                targetSeekerProfileId: targetSeekerProfileId || null,
                score,
                explanation,
                source,
            },
        });
        this.logger.log(`Score created: ${result.id} = ${score} (${source})`);
        return result;
    }
    async callGemini(seeker, targetType, targetPropertyId, targetSeekerProfileId) {
        if (!this.geminiApiKey || this.geminiApiKey === 'your-google-ai-studio-key') {
            throw new Error('Gemini API key not configured');
        }
        let userPrompt;
        if (targetType === 'PROPERTY' && targetPropertyId) {
            const property = await this.prisma.property.findUnique({
                where: { id: targetPropertyId },
            });
            if (!property)
                throw new Error('Target property not found');
            userPrompt = (0, scoring_prompts_js_1.buildPropertyScoringPrompt)(seeker, property);
        }
        else if (targetType === 'SEEKER_PROFILE' && targetSeekerProfileId) {
            const targetSeeker = await this.prisma.seekerProfile.findUnique({
                where: { id: targetSeekerProfileId },
            });
            if (!targetSeeker)
                throw new Error('Target seeker not found');
            userPrompt = (0, scoring_prompts_js_1.buildSeekerScoringPrompt)(seeker, targetSeeker);
        }
        else {
            throw new Error('Invalid target type or missing target ID');
        }
        const systemPrompt = (0, scoring_prompts_js_1.buildSystemPrompt)();
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.geminiApiKey });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await ai.models.generateContent({
                model: this.geminiModel,
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
                ],
                config: {
                    temperature: 0.1,
                    maxOutputTokens: 256,
                },
            });
            clearTimeout(timeout);
            const text = response.text || '';
            const jsonMatch = text.match(/\{[\s\S]*?\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in LLM response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed.score !== 'number' || typeof parsed.explanation !== 'string') {
                throw new Error('Invalid JSON structure from LLM');
            }
            return {
                score: Math.max(0, Math.min(100, Math.round(parsed.score))),
                explanation: parsed.explanation.substring(0, 500),
            };
        }
        catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
    async runFallback(seeker, targetType, targetPropertyId, targetSeekerProfileId) {
        if (targetType === 'PROPERTY' && targetPropertyId) {
            const property = await this.prisma.property.findUnique({
                where: { id: targetPropertyId },
            });
            if (!property)
                throw new Error('Target property not found');
            return (0, scoring_fallback_js_1.scoreSeekerVsProperty)(seeker, property);
        }
        else if (targetType === 'SEEKER_PROFILE' && targetSeekerProfileId) {
            const targetSeeker = await this.prisma.seekerProfile.findUnique({
                where: { id: targetSeekerProfileId },
            });
            if (!targetSeeker)
                throw new Error('Target seeker not found');
            return (0, scoring_fallback_js_1.scoreSeekerVsSeeker)(seeker, targetSeeker);
        }
        throw new Error('Invalid target');
    }
};
exports.ScoringProcessor = ScoringProcessor;
exports.ScoringProcessor = ScoringProcessor = ScoringProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('scoring'),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        config_1.ConfigService])
], ScoringProcessor);
//# sourceMappingURL=scoring.processor.js.map