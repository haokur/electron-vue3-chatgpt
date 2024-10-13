/// <reference path="../../../@types/config.d.ts" />

/**可以供C端使用的electron的API */
type onEventType = 'fromMain' | 'replyRenderer';
declare const $electron: {
  /**监听 */
  $on(event: onEventType, callback: Function);
  /**提交事件到preload,preload转发到main进程 */
  $emit: (action: string, args?: any) => void;
  $remove: any;
  $removeAll: any;
};

interface IGlobalData {
  mockUrl: String;
  apifoxToken: String;
  base: {
    fmtTableReq: Function;
    fmtTableRes: Function;
  };
}

interface AnyObject<T = any> {
  [key: string | number]: T;
}

declare const GlobalData: IGlobalData;
