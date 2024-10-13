import { v4 as uuidv4 } from 'uuid';

const MainEventListenerMap = {};

const listenerMap = {};
let isInitFlag = false;

// 仅初始化一次监听来自preload转发的main的回复消息
function _listenMainReply() {
  $electron.$on('replyRenderer', (_, data) => {
    const { actionId, result } = data;
    const callback = listenerMap[actionId];
    if (!callback) return;

    const deleteCallback = () => {
      delete listenerMap[actionId];
    };

    if (callback(result, deleteCallback)) {
      return deleteCallback();
    }
  });
}

// 监听main主动发送的消息
function listenMainEmit() {
  $electron.$on('fromMain', async (_, action, options) => {
    const rendererHandlers = MainEventListenerMap[action];
    if (!rendererHandlers) return;

    rendererHandlers.forEach(async (rendererHandler: Function) => {
      // const { actionId } = options;
      const actionId = options?.actionId;
      const result = await rendererHandler(options);
      if (result) {
        $electron.$emit('replyMain', {
          action,
          actionId,
          result,
        });
      }
    });
  });
}

// 添加main事件监听者
function addMainEventListener(action: string, callback: Function) {
  if (!MainEventListenerMap[action]) {
    MainEventListenerMap[action] = new Set();
  }
  MainEventListenerMap[action].add(callback);
  return () => {
    MainEventListenerMap[action].delete(callback);
  };
}

// 移除main事件监听者
function removeMainEventListener(action: string, callback: Function) {
  if (MainEventListenerMap[action]) {
    MainEventListenerMap[action].delete(callback);
  }
}

function _initEventListener() {
  isInitFlag = true;
  _listenMainReply();
}

function ipcRun(action: EventAction, options = {}, callback?) {
  if (!isInitFlag) _initEventListener();
  const actionId = uuidv4();
  listenerMap[actionId] = (...args) => {
    callback && callback(...args);
    return true; // 返回true，用来标识可以删除事件，仅监听一次
  };
  $electron.$emit(action, { ...options, actionId });
}

function ipcWatch(action, options, listener) {
  if (!isInitFlag) _initEventListener();
  const actionId = uuidv4();
  if (!listener) {
    return console.warn('监听方法，需要一个监听回调方法');
  }
  listenerMap[actionId] = listener;
  $electron.$emit(action, { ...options, actionId });

  return () => {};
}

export default {
  ipcRun,
  ipcWatch,
  listenMainEmit,
  addMainEventListener,
  removeMainEventListener,
};
