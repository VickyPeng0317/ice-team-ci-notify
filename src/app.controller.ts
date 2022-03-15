import { BaseLineNotifyService } from './core/services/base-line-notify-service';
import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LOVE_TEXT_LIST } from './core/mocks/love-text-list';
import * as fs from 'fs';
import moment = require('moment');
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private baseLineNotifyService: BaseLineNotifyService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('love')
  getLove() {
    return {
      data: LOVE_TEXT_LIST
    };
  }

  @Get('record')
  async getRecord(): Promise<any> {
    const data = await this.baseLineNotifyService.getLineRecordList();
    return data;
  }

  
  @Get('record2')
  async getRecord2(): Promise<any> {
    const data = await this.baseLineNotifyService.getText();
    return data;
  }


  @Get('read2')
  async read2() {
    const KEYWORD_LIST = ['寶貝'];
    const FROM_SETTING = { 
      inRecordFrom: '小胖子',
      resFrom: 'vicky',
      resTo: 'peng'
    };
    const recordList = await this.baseLineNotifyService.getLineRecordList();
    const matchMessageList = recordList.filter(recordItem => 
      this.baseLineNotifyService.checkHasKeyword(recordItem, KEYWORD_LIST)
    );
    const dateList = [... new Set(recordList.map(item => item.date))];
    const everyDayLenList = dateList.map(date => {
      const len = matchMessageList.filter(o => o.text.includes(date)).length;
      return { date, len };
    });
    return {
      [FROM_SETTING.resFrom]: matchMessageList.filter(x => x.from === FROM_SETTING.inRecordFrom).length,
      [FROM_SETTING.resTo]: matchMessageList.filter(x => x.from !== FROM_SETTING.inRecordFrom).length,
      everyDayLenList,
    };
  }
}
