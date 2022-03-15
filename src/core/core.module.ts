import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BaseLineNotifyService } from './services/base-line-notify-service';

@Module({
  controllers: [],
  imports: [ScheduleModule.forRoot()],
  providers: [BaseLineNotifyService],
  exports: [BaseLineNotifyService]
})
export class CoreModule {}
