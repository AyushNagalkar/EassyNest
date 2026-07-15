import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  buildSystemPrompt,
  buildPropertyScoringPrompt,
  buildSeekerScoringPrompt,
} from './scoring.prompts.js';
import {
  scoreSeekerVsProperty,
  scoreSeekerVsSeeker,
} from './scoring.fallback.js';

interface ScoringJobData {
  seekerProfileId: string;
  targetType: 'PROPERTY' | 'SEEKER_PROFILE';
  targetPropertyId?: string;
  targetSeekerProfileId?: string;
}

@Processor('scoring')
export class ScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoringProcessor.name);
  private geminiApiKey: string;
  private geminiModel: string;
  private timeoutMs: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
    this.geminiApiKey = this.configService.get<string>('gemini.apiKey') || '';
    this.geminiModel = this.configService.get<string>('gemini.model') || 'gemini-2.5-flash';
    this.timeoutMs = this.configService.get<number>('gemini.timeoutMs') || 8000;
  }

  async process(job: Job<ScoringJobData>) {
    const { seekerProfileId, targetType, targetPropertyId, targetSeekerProfileId } = job.data;
    this.logger.log(`Processing scoring job ${job.id}: seeker=${seekerProfileId} target=${targetType}`);

    // Check if score already exists
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

    // Load seeker profile
    const seeker = await this.prisma.seekerProfile.findUnique({
      where: { id: seekerProfileId },
    });
    if (!seeker) {
      throw new Error(`Seeker profile ${seekerProfileId} not found`);
    }

    let score: number;
    let explanation: string;
    let source: 'LLM' | 'RULE_BASED' = 'LLM';

    try {
      // Try LLM scoring
      const llmResult = await this.callGemini(seeker, targetType, targetPropertyId, targetSeekerProfileId);
      score = llmResult.score;
      explanation = llmResult.explanation;
    } catch (error) {
      this.logger.warn(`LLM scoring failed, using fallback: ${error}`);
      // Fallback to rule-based
      const fallbackResult = await this.runFallback(seeker, targetType, targetPropertyId, targetSeekerProfileId);
      score = fallbackResult.score;
      explanation = fallbackResult.explanation;
      source = 'RULE_BASED';
    }

    // Persist score
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

  private async callGemini(
    seeker: any,
    targetType: string,
    targetPropertyId?: string,
    targetSeekerProfileId?: string,
  ): Promise<{ score: number; explanation: string }> {
    if (!this.geminiApiKey || this.geminiApiKey === 'your-google-ai-studio-key') {
      throw new Error('Gemini API key not configured');
    }

    let userPrompt: string;

    if (targetType === 'PROPERTY' && targetPropertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: targetPropertyId },
      });
      if (!property) throw new Error('Target property not found');
      userPrompt = buildPropertyScoringPrompt(seeker, property);
    } else if (targetType === 'SEEKER_PROFILE' && targetSeekerProfileId) {
      const targetSeeker = await this.prisma.seekerProfile.findUnique({
        where: { id: targetSeekerProfileId },
      });
      if (!targetSeeker) throw new Error('Target seeker not found');
      userPrompt = buildSeekerScoringPrompt(seeker, targetSeeker);
    } else {
      throw new Error('Invalid target type or missing target ID');
    }

    const systemPrompt = buildSystemPrompt();

    // Use Gemini API via REST (compatible with @google/genai)
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
      // Extract JSON from response (handle potential markdown wrapping)
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
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private async runFallback(
    seeker: any,
    targetType: string,
    targetPropertyId?: string,
    targetSeekerProfileId?: string,
  ): Promise<{ score: number; explanation: string }> {
    if (targetType === 'PROPERTY' && targetPropertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: targetPropertyId },
      });
      if (!property) throw new Error('Target property not found');
      return scoreSeekerVsProperty(seeker, property);
    } else if (targetType === 'SEEKER_PROFILE' && targetSeekerProfileId) {
      const targetSeeker = await this.prisma.seekerProfile.findUnique({
        where: { id: targetSeekerProfileId },
      });
      if (!targetSeeker) throw new Error('Target seeker not found');
      return scoreSeekerVsSeeker(seeker, targetSeeker);
    }
    throw new Error('Invalid target');
  }
}
