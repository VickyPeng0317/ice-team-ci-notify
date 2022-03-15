import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LineNotifyAction, LineNotify } from '../decorators/line-notify-send';
import { LOVE_TEXT_LIST, LOVE_TEXT_LIST2, LOVE_TEXT_LIST3 } from '../mocks/love-text-list';
import * as moment from 'moment';
import * as fs from 'fs';
@Injectable()
export class BaseLineNotifyService {
  // 貼圖 stickerId 對照表
  // https://developers.line.biz/en/docs/messaging-api/sticker-list/#sticker-definitions
  NOTIFY_TOKEN = 'HEQarmkZkOrl77HzjwaPz50qC1ZVKmEBcHA6mQ8uIjl';
  TOKEN = 'JSqsNFydTNO82ce0lp0DNgTrNZzRADrHw2WZEKVm7CF';
  @LineNotify()
  sendMessage: LineNotifyAction;

  @LineNotify({
    stickerPackageId: 11537,
    stickerId: 52002752
  })
  sendSuccessStickerMessage: LineNotifyAction;

  @LineNotify({
    stickerPackageId: 2,
    stickerId: 524
  })
  sendErrorStickerMessage: LineNotifyAction;

  @Cron('15 30 06 * * *')
  everydayLove() {
    const loveDays = this.caculateLoveDays('2020-10-31');
    const loveText = this.getLoveText(+loveDays);
    const message = `\n幸福快樂第 ${loveDays} 天\n${loveText}`;
    this.sendMessage(message, this.TOKEN);
  }

  // @Cron('*/5 * * * * *')
  // async everydayLove2() {
  //   const loveDays = this.caculateLoveDays('2020-10-31');
  //   const loveText = await this.getText();
  //   const message = `${loveText}`;
  //   const isYear = (+loveDays) % 365 === 0;
  //   const is100Day = (+loveDays) % 100 === 0;
  //   if (isYear || is100Day) {
  //     this.sendSuccessStickerMessage(message, this.NOTIFY_TOKEN);
  //     return;
  //   }
  //   this.sendMessage(message, this.NOTIFY_TOKEN);
  // }

  getLoveText(loveDays = 100) {
    const loveTextList = (loveDays%2 === 0) ? LOVE_TEXT_LIST : LOVE_TEXT_LIST3;
    const index = Math.floor(Math.random()*(loveTextList.length));
    const loveText = loveTextList[index];
    return loveText;
  }

  caculateLoveDays(startDateStr) {
    const startDate = moment(startDateStr);
    const endDate = moment();
    const days = endDate.diff(startDate, 'days').toString();
    return days;
  }

  async getText() {
    const res = await fs.promises.readFile('src/assets/record.txt');
    const list = res.toString().split('\n').filter(x => x.includes(':') || x.includes('/')).map((x, index) => {
      const isDate = x.includes('週') && !x.includes('\t') && moment(x.split('（')[0]).format('YYYY/MM/DD HH:mm:ss') !== 'Invalid date' ;
      const type =  !isDate ? 'message' : 'date';
      const origin = x;
      const [time, from, message] = origin.split('\t');
      return {
        index, type, time, from, message, origin
      }
    }).filter(item => item.type === 'message' && !!item.message
      ? item.message?.includes('愛') || item.message?.includes('喜歡')
      : true
    );
    const dateList = list.filter(x => x.type === 'date');
    let messageList = list.filter(x => x.type === 'message');
    const textList = messageList.map(item => {
      const dateIndex = Math.max(...dateList.filter(x => item.index > x.index).map(x => x.index));
      const date = dateList.find(x => x.index === dateIndex).origin;
      const text = date + item.time + `\n${item.from}: ` +item.message;
      return {...item, date, text}
    }).map(x => x.text);
    const index = Math.floor(Math.random()*(textList.length));
    return textList[index];
  }
}