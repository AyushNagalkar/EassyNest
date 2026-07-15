import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { SeekerProfileModule } from './seeker-profile/seeker-profile.module.js';
import { ScoringModule } from './scoring/scoring.module.js';
import { InterestsModule } from './interests/interests.module.js';
import { ChatModule } from './chat/chat.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { EmailModule } from './email/email.module.js';
import { UploadModule } from './upload/upload.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { AdminModule } from './admin/admin.module.js';
import { SavedSearchesModule } from './saved-searches/saved-searches.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { FlagsModule } from './flags/flags.module.js';
import configuration from './config/configuration.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    PropertiesModule,
    SeekerProfileModule,
    ScoringModule,
    InterestsModule,
    ChatModule,
    NotificationsModule,
    EmailModule,
    UploadModule,
    FavoritesModule,
    AdminModule,
    SavedSearchesModule,
    ReviewsModule,
    FlagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
