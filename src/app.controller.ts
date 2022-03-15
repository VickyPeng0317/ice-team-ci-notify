import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LOVE_TEXT_LIST } from './core/mocks/love-text-list';
import * as fs from 'fs';
import moment = require('moment');
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Get('read')
  async read() {
    const res = await fs.promises.readFile('src/assets/record.txt');
    const list = res.toString().split('\n').filter(x => x.includes(':') || x.includes('/')).map((x, index) => {
      const isDate = x.includes('週') && !x.includes('\t') && moment(x.split('（')[0]).format('YYYY/MM/DD HH:mm:ss') !== 'Invalid date' ;
      const type =  !isDate ? 'message' : 'date';
      const origin = x;
      const [time, from, message] = origin.split('\t');
      const text = '';
      return {
        index, type, time, from, message, origin, text
      }
    }).filter(item => item.type === 'message' && !!item.message
      ? item.message?.includes('哈哈')
      : true
    );
    let dateList = list.filter(x => x.type === 'date');
    let messageList = list.filter(x => x.type === 'message');
    messageList = messageList.map((item) => {
      const dateIndex = Math.max(...dateList.filter(x => item.index > x.index).map(x => x.index));
      const date = dateList.find(x => x.index === dateIndex).origin;
      const text = date + item.time + `\n${item.from}: ` +item.message;
      return {...item, date, text}
    });
    dateList = dateList.map(x => {
      const loveLen = messageList.filter(o => o.text.includes(x.origin)).length;
      return {...x, loveLen}
    });
    return {
      dateList: dateList,
      vicky: messageList.filter(x => x.from === '小胖子').length,
      peng: messageList.filter(x => x.from !== '小胖子').length
    };
  }
}
