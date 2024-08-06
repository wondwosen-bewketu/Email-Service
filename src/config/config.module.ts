import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import emailConfig from './email.config';
import appConfig from './app.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [emailConfig, appConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
