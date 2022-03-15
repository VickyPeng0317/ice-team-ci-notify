import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
@Injectable()
export class AppService {
  getHello(): string {
    const startDate = moment('2020-10-31');
    const endDate = moment('2021-10-31');
    const days = endDate.diff(startDate, 'days');
    return days.toString();
  }
  // @Cron('*/5 * * * * *')
  // handleCron() {
  //   console.log(123);
  // }
}
