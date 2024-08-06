import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [ConfigModule, EmailModule],
})
export class AppModule {}
