import { Module } from '@nestjs/common';
import { SavedSearchesController } from './saved-searches.controller.js';

@Module({
  controllers: [SavedSearchesController],
})
export class SavedSearchesModule {}
