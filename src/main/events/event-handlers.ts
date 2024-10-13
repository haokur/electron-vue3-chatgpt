/**
 * electron主进程暴漏给render进程的方法扩展池：
 * 格式如下：定义一个异步方法，接受render传入的参数，方法内可以执行耗时操作，返回一个结果
 * export async function test(params){await xxx; return result}
 */
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

import { electronUtil } from '../utils/electron.util';
import {
  checkAppVersion,
  initVersionUpdater,
  installAppNow,
  downloadAppNow,
} from '../utils/updater.util';

/**创建文件夹 */
export async function mkdir(dirPath) {
  const userDataPath = app.getPath('userData');
  let _path = path.join(userDataPath, dirPath);
  fs.mkdirSync(_path);
  return `创建成功:${_path}`;
}

/**打开开发者工具 */
export function toggleDevTools(_, win) {
  const isDevToolsOpen = win.webContents.isDevToolsOpened();
  isDevToolsOpen ? win.closeDevTools() : win.openDevTools();

  electronUtil.showNotice('切换成功~');
  return isDevToolsOpen;
}

/**[test]测试main进程里的配置 */
export function testMainAppConfig() {
  let _config = electronUtil.getAppConfig();
  electronUtil.showNotice(JSON.stringify(_config.env));
}

/**暴漏接口让renderer可以获取electron的配置 */
export function getElectronAppConfig() {
  return {
    appPath: electronUtil.getAppPath(),
    userDataPath: electronUtil.getUserDataPath(),
  };
}

/**获取当前应用版本号 */
export async function getAppSystemInfo() {
  return {
    version: app.getVersion(),
  };
}

/**重载应用 */
export function reLaunch() {
  app.relaunch();
  app.exit(0);
}

/**测试持续给renderer发消息 */
export function sendManyMsg2Render() {
  return (send) => {
    setInterval(() => {
      send({ timestamp: Date.now() });
    }, 3000);
  };
}

/**版本相关 */
// 持续监听版本更新中的信息
export function watchAutoUpdateInfo() {
  return (send) => {
    initVersionUpdater(send);
  };
}

// 检查更新
export function checkUpdateInfo() {
  checkAppVersion();
}

// 确认下载更新
export function downloadLatestApp() {
  downloadAppNow();
}

// 安装更新
export function installLatestApp() {
  installAppNow();
}
