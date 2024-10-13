import { contextBridge, ipcRenderer } from 'electron';

// 注册到$electron,给renderer使用
contextBridge.exposeInMainWorld('$electron', {
  $on: ipcRenderer.on.bind(ipcRenderer),
  $emit(action: string, ...args: any) {
    ipcRenderer.send('preload', action, ...args);
  },
  // 可用,移除renderer(Vue应用)所有监听
  $removeAll: ipcRenderer.removeAllListeners.bind(ipcRenderer),
});
