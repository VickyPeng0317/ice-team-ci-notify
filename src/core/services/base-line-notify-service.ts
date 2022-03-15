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
    const KEYWORD_LIST = ['愛', '喜歡'];
    const recordList = await this.getLineRecordList();
    const matchRecordList = recordList.filter(recordItem => this.checkHasKeyword(recordItem, KEYWORD_LIST));
    const matchRecordTextList = matchRecordList.map(x => x.text);
    const index = Math.floor(Math.random()*(matchRecordTextList.length));
    return matchRecordTextList[index];
  }

  checkHasKeyword(recordItem: IRecordItem, keywordList: string[]){
    const { type, message } = recordItem;
    const isMessage = type === 'message';
    const hasMessage = !!message;
    if (!isMessage || !hasMessage) {
      return false;
    }
    const hasKeyWord = keywordList.some(keyword => message?.includes(keyword));
    return hasKeyWord;
  }

  async getLineRecordList(): Promise<IRecordItem[]> {
    const recordFile = await fs.promises.readFile('src/assets/record.txt');
    const allRecord = recordFile.toString().split('\n').filter(x => x.includes(':') || x.includes('/')).map((x, index) => {
      const isDate = x.includes('週') && !x.includes('\t') && moment(x.split('（')[0]).format('yyyy/MM/dd HH:mm:ss') !== 'Invalid date' ;
      const type =  !isDate ? 'message' : 'date';
      const origin = x;
      const [time, from, message] = origin.split('\t');
      return {
        index, type, time, from, message, origin
      }
    });
    const dateList = allRecord.filter(x => x.type === 'date');
    const messageList = allRecord.filter(x => x.type === 'message')
    const recordList: IRecordItem[] = messageList.map(item => {
      const dateIndex = Math.max(...dateList.filter(x => item.index > x.index).map(x => x.index));
      const date = dateList.find(x => x.index === dateIndex)?.origin;
      const text = date + item.time + `\n${item.from}: ` +item.message;
      return {...item, date, text};
    });
    return recordList;
  }
}

interface IRecordItem {
  index: number;
  type: string;
  time: string;
  from: string;
  message: string;
  origin: string;
  date: string;
  text: string;
}