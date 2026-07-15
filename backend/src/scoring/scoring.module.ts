import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ScoringController } from './scoring.controller.js';
import { ScoringService } from './scoring.service.js';
import { ScoringProcessor } from './scoring.processor.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url') || '';
        if (!redisUrl) {
          return { connection: { host: 'localhost', port: 6379 } };
        }
        // Parse Upstash Redis URL
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
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'scoring' }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [ScoringController],
  providers: [ScoringService, ScoringProcessor],
  exports: [ScoringService, BullModule],
})
export class ScoringModule {}
