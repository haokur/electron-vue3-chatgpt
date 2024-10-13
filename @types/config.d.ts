declare var CUSTOM_ENV: string;

/**electron端全局变量 */
interface IGlobalData {
  AppConfig: IAppConfig;
}

interface IAppConfig {
  /**是否重写main进程的console.log,使得可以在renderer控制层输出 */
  overwriteConsole?: boolean;
  /**环境 */
  env: string;
  /**环境名称 */
  envName: string;
  /**oss云根路径 */
  ossHost: string;
  /**oss云实例配置 */
  ossClient: {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  };
}

type EventAction =
  | 'mkdir'
  | 'toggleDevTools'
  | 'reLaunch'
  | 'testMainAppConfig'
  | 'parseExcel'
  | 'uploadLocalImg'
  | 'exportExcelFile'
  | 'openFileOrDir'
  | 'moveReplaceFile'
  | 'downloadImgsOfExcel'
  | 'electronUpdaterDownload'
  | 'electronUpdaterInstall'
  | 'getAppSystemInfo'
  | 'checkForUpdatesAndNotify'
  | 'checkForUpdates'
  | 'getAllFiles'
  | 'png2Webp'
  | 'checkLatestVersion'
  | 'checkUpdateInfo'
  | 'downloadLatestApp'
  | 'installLatestApp';
