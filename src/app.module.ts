import { HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CiNotifyModule } from './feature/ci-notify/ci-notify.module';

@Module({
  imports: [CiNotifyModule, ScheduleModule.forRoot(), HttpModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
