import { Module } from '@nestjs/common';
import { SeekerProfileController } from './seeker-profile.controller.js';
import { SeekerProfileService } from './seeker-profile.service.js';

@Module({
  controllers: [SeekerProfileController],
  providers: [SeekerProfileService],
  exports: [SeekerProfileService],
})
export class SeekerProfileModule {}
