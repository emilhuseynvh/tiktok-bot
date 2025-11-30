import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import config from './config';
import { BotUpdate } from './update/bot.update';
import { TikTokService } from './service/tiktok.service';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: config.telegramBotToken ?? ''
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BotUpdate, TikTokService],
})
export class AppModule {}
