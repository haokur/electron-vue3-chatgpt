/**
 * 仅作为收集event-handler导出的所有方法
 * 给render层发送信息方法，不需要再添加扩展
 * 固定下来的文件。
 */
import { ipcMain, BrowserWindow } from 'electron';

import * as eventHandlerFuncs from './event-handlers';

export function injectListenEvents() {
  // 监听从preload传递的消息
  ipcMain.on('preload', async (event, action, options) => {
    if (!action) {
      throw '请传入action参数';
    }
    if (action && eventHandlerFuncs[action]) {
      try {
        const senderWebContents = event.sender;
        const senderWindow = BrowserWindow.fromWebContents(senderWebContents);
        let result = await eventHandlerFuncs[action](options, senderWindow);
        if (typeof result === 'function') {
          // 如果是方法，则调用执行，方法里去发送信息
          result((data) => {
            senderWebContents.send('replyRenderer', {
              action,
              result: data,
              actionId: options.actionId,
            });
            console.log(`watch-${action}出参：\n${JSON.stringify(data, null, 4)}`);
          });
        } else {
          // 发送给C端
          senderWebContents.send('replyRenderer', {
            action,
            result,
            actionId: options.actionId,
          });
          console.log('\n\n>>>>>>>>>>>>>>>>>');
          console.log(`${action}入参：\n${JSON.stringify(options, null, 4)}`);
          console.log(`${action}出参：\n${JSON.stringify(result, null, 4)}`);
          console.log('<<<<<<<<<<<<<<<<<\n');
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      throw `action为${action},未找到该action的方法,请检查`;
    }
  });
}
