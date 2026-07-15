import { Module } from '@nestjs/common';
import { InterestsController } from './interests.controller.js';
import { InterestsService } from './interests.service.js';
import { EmailModule } from '../email/email.module.js';
import { ScoringModule } from '../scoring/scoring.module.js';

@Module({
  imports: [EmailModule, ScoringModule],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [InterestsService],
})
export class InterestsModule {}
