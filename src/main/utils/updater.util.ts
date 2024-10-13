import { autoUpdater } from 'electron-updater';

const isDevelopment = process.env.NODE_ENV === 'development';

const updaterFeedUrl = isDevelopment
  ? 'http://192.168.1.103:8081/'
  : 'https://static.haokur.com/electron-app/';

// 发送给renderer的方法
let sender = {
  sendMessage: (data) => {
    console.log('请使用event-handlers里的方法初始化进度更新回调方法', data);
  },
};

// 初始化更新的监听,可以更新发送者，但是不重新监听下载进度更新事件
let isInitListener = false;
export function initVersionUpdater(send) {
  sender.sendMessage = send;
  if (isInitListener) return;
  isInitListener = true;

  autoUpdater.setFeedURL(updaterFeedUrl);
  autoUpdater.autoDownload = false;

  autoUpdater.on('error', function (error) {
    sender.sendMessage({ event: 'error', message: '出错了', data: error });
  });

  // 2. 开始检查是否有更新
  autoUpdater.on('checking-for-update', function () {
    sender.sendMessage({ event: 'checking-for-update', message: '开始检查是否有更新', data: null });
  });

  // 3. 有更新时触发
  autoUpdater.on('update-available', function (info) {
    sender.sendMessage({ event: 'update-available', data: info });
  });

  autoUpdater.on('update-not-available', function (info) {
    sender.sendMessage({ event: 'update-not-available', data: info });
  });

  // 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
  // ps: 调试时，想重复更新，会因为缓存导致该事件不执行，下载直接完成，可找到C:\Users\40551\AppData\Local\xxx-updater\pending下的缓存文件将其删除（这是我本地的路径）
  autoUpdater.on('download-progress', function (progressObj) {
    sender.sendMessage({ event: 'download-progress', data: progressObj });
  });

  // 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
  autoUpdater.on('update-downloaded', function () {
    sender.sendMessage({ event: 'update-downloaded' });
  });
}

/**检查更新 */
export function checkAppVersion() {
  autoUpdater.checkForUpdatesAndNotify();
}

/**确认下载更新 */
export function downloadAppNow() {
  autoUpdater.downloadUpdate();
}

/**取消下载，autoUpdater并未提供方法 */
// export function cancelDownloadApp() {}

/**确认安装 */
export function installAppNow() {
  autoUpdater.quitAndInstall();
}
