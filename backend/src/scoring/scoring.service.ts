import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
import { scoreSeekerVsProperty, scoreSeekerVsSeeker } from './scoring.fallback.js';

@Injectable()
export class ScoringService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('scoring') private scoringQueue: Queue,
  ) {}

  private async runWithTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
    let timeoutId;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Redis/Queue connection timeout'));
      }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  /**
   * Trigger scoring for a tenant against a property.
   * Returns cached score if exists, otherwise enqueues a job.
   * Falls back to synchronous rule-based execution if Redis is offline/timed out.
   */
  async scoreProperty(seekerProfileId: string, propertyId: string) {
    // Check if property exists
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    // Check cache
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
      // Try to enqueue scoring job with a timeout
      const job = await this.runWithTimeout(
        this.scoringQueue.add(
          'score',
          {
            seekerProfileId,
            targetType: 'PROPERTY',
            targetPropertyId: propertyId,
          },
          {
            attempts: 2,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        )
      );

      return { status: 'queued', jobId: job.id };
    } catch (error) {
      console.warn(
        `Scoring queue failed for property ${propertyId}, running synchronous fallback: ${error.message}`
      );

      // Load seeker profile
      const seeker = await this.prisma.seekerProfile.findUnique({
        where: { id: seekerProfileId },
      });
      if (!seeker) throw new NotFoundException('Seeker profile not found');

      // Calculate score synchronously using fallback logic
      const { score, explanation } = scoreSeekerVsProperty(seeker, property);

      // Save directly to the database
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
      } else {
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

  /**
   * Trigger scoring for a tenant against another seeker (flatmate matching).
   * Falls back to synchronous rule-based execution if Redis is offline/timed out.
   */
  async scoreSeeker(seekerProfileId: string, targetSeekerProfileId: string) {
    // Check if target exists
    const target = await this.prisma.seekerProfile.findUnique({
      where: { id: targetSeekerProfileId },
    });
    if (!target) throw new NotFoundException('Target seeker profile not found');

    // Check cache
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
      // Try to enqueue scoring job with a timeout
      const job = await this.runWithTimeout(
        this.scoringQueue.add(
          'score',
          {
            seekerProfileId,
            targetType: 'SEEKER_PROFILE',
            targetSeekerProfileId,
          },
          {
            attempts: 2,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        )
      );

      return { status: 'queued', jobId: job.id };
    } catch (error) {
      console.warn(
        `Scoring queue failed for flatmate match ${targetSeekerProfileId}, running synchronous fallback: ${error.message}`
      );

      // Load seeker profile
      const seekerA = await this.prisma.seekerProfile.findUnique({
        where: { id: seekerProfileId },
      });
      if (!seekerA) throw new NotFoundException('Seeker profile not found');

      // Calculate score synchronously using fallback logic
      const { score, explanation } = scoreSeekerVsSeeker(seekerA, target);

      // Save directly to the database
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
      } else {
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

  /**
   * Get a specific score by ID.
   */
  async getScore(id: string) {
    const score = await this.prisma.compatibilityScore.findUnique({
      where: { id },
    });
    if (!score) throw new NotFoundException('Score not found');
    return score;
  }

  /**
   * Get score for a seeker vs specific property (if it exists).
   */
  async getPropertyScore(seekerProfileId: string, propertyId: string) {
    const score = await this.prisma.compatibilityScore.findFirst({
      where: {
        seekerProfileId,
        targetType: 'PROPERTY',
        targetPropertyId: propertyId,
      },
    });
    return score;
  }
}
