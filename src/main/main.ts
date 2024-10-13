import { app, BrowserWindow, globalShortcut, Menu, screen, Tray } from 'electron';
import path from 'node:path';
import { menubar } from 'menubar';
const { autoUpdater } = require('electron-updater');

import { injectListenEvents } from './events/events';
import { electronUtil } from './utils/electron.util';
const AppPath = app.getAppPath();

const isDevelopment = process.env.NODE_ENV === 'development';

function createWindow() {
  // const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  // 获取主屏幕的完整尺寸（包含任务栏等）
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().bounds;

  // 设置窗口的宽度和高度
  const windowWidth = 400; // 你可以根据需要设置窗口的宽度
  const windowHeight = screenHeight; // 高度设为屏幕高度

  // 计算窗口的 x 坐标，让窗口贴在屏幕右侧
  const x = screenWidth - windowWidth;

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: 0, // 如果不设置y，x不会生效
    // titleBarStyle: 'hidden', // 隐藏标题栏，这里与frame为false冲突
    show: false, // 初始时不显示窗口
    frame: false, // 去掉顶部的关闭、放大、缩小、全屏按钮
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDevelopment,
    },
  });

  // 监听窗口的聚焦事件
  mainWindow.on('focus', () => {
    electronUtil.sendMessage2MainRender('winFocusOrBlur', { focus: true }, mainWindow);
  });

  mainWindow.on('blur', () => {
    electronUtil.sendMessage2MainRender('winFocusOrBlur', { blur: true }, mainWindow);
  });

  let menubarIndexUrl = '';
  if (isDevelopment) {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
    // mainWindow.webContents.openDevTools();

    menubarIndexUrl = `http://localhost:${rendererPort}#/about`;

    // 开发用来测试环境版本更新配置
    autoUpdater.currentVersion = '0.1.0';
    Object.defineProperty(app, 'isPackaged', {
      get() {
        return true;
      },
    });
    autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml');
  } else {
    const indexHtmlPath = path.join(app.getAppPath(), 'renderer', 'index.html');
    mainWindow.loadFile(indexHtmlPath, {
      query: { hash: '#/dashboard' },
    });
    menubarIndexUrl = `file://${indexHtmlPath}#/about`;
  }
  electronUtil.setMainWindow(mainWindow);

  const iconPath = path.join(AppPath, 'static/icons/IconTemplate.png');
  const tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: '设置', type: 'radio' },
    {
      label: '退出',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  function setOkIcon() {
    mb.tray.setImage(path.join(AppPath, 'static/icons/state-ok-20.png'));
  }

  function setStaticIcon() {
    mb.tray.setImage(path.join(AppPath, 'static/icons/IconTemplate.png'));
  }

  function frame() {
    setTimeout(() => mb.tray.setImage(path.join(AppPath, 'static/icons/state-sync-20.png')), 300);
    setTimeout(
      () => mb.tray.setImage(path.join(AppPath, 'static/icons/state-sync-20-60.png')),
      600,
    );
    setTimeout(
      () => mb.tray.setImage(path.join(AppPath, 'static/icons/state-sync-20-120.png')),
      900,
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const mb = menubar({
    tray,
    index: false,
    // index: menubarIndexUrl,
    showDockIcon: false,
    // loadUrlOptions: {
    //   query: { hash: '#/about' },
    // },
    // browserWindow: {
    //   width: 400,
    //   height: 400,
    //   webPreferences: {
    //     preload: path.join(__dirname, 'preload.js'),
    //     devTools: isDevelopment,
    //   },
    // },
  });

  mb.on('ready', () => {
    tray.removeAllListeners();
    // 加载动画，轮询执行
    const trayAnimation = setInterval(frame, 1000);
    // 三秒后结束动画
    sleep(3000).then(() => {
      clearInterval(trayAnimation);
      setOkIcon();
      setTimeout(setStaticIcon, 400);
    });
  });
  mb.on('after-create-window', () => {
    console.log('窗体创建成功', 'main.ts::62行');
    // mb.window?.webContents.openDevTools();
  });

  // 监听绑定
  injectListenEvents();

  return { mainWindow, mb };
}

let isVisible = false; // 跟踪窗口是否可见
function toggleWindowState(mainWindow: BrowserWindow) {
  if (isVisible) {
    mainWindow.hide();
    // slideInOutWindow(mainWindow, 'out', () => {
    //   mainWindow.hide();
    // });
    isVisible = false;
  } else {
    mainWindow.show();
    // slideInOutWindow(mainWindow, 'in');
    isVisible = true;
  }
}

// 窗口从右侧滑入滑出
// TODO：滑出ok，划入动画不行，先不用窗口渐入渐出效果
function slideInOutWindow(mainWindow: BrowserWindow, direction: string, callback?: Function) {
  if (!mainWindow) return;
  const { width } = screen.getPrimaryDisplay().bounds;
  let targetX = 0;

  let currentX = mainWindow.getBounds().x;

  const isIn = direction === 'in';
  const isOut = direction === 'out';

  if (isIn) {
    targetX = width - mainWindow.getBounds().width;
    // 首先让窗口显示
    mainWindow.setBounds({
      x: width,
    });
    mainWindow.show();
  } else if (isOut) {
    targetX = width;
  }

  const stepPx = isIn ? -10 : 10;

  // 动画效果（通过每次小幅度移动窗口实现）
  const interval = setInterval(() => {
    const isFinished = (isIn && currentX <= targetX) || (isOut && currentX >= targetX);
    if (isFinished) {
      clearInterval(interval);
      callback && callback();
    } else {
      currentX += stepPx;
      mainWindow.setBounds({
        x: currentX,
      });
    }
  }, 16);
}

app.whenReady().then(() => {
  // 如果是 macOS，隐藏应用在 Dock 上显示
  // if (process.platform === 'darwin') {
  //   app.dock.hide();
  // }

  const { mainWindow } = createWindow();

  // 注册全局快捷键 alt+. 来切换窗口状态
  const ret = globalShortcut.register('Alt+.', () => {
    toggleWindowState(mainWindow);
  });

  if (!ret) {
    console.log('快捷键注册失败');
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregister('Alt+.');
});
