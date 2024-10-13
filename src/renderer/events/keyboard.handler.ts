import Mousetrap from 'mousetrap';
import ipcHelperUtil from '../utils/ipc-helper.util';

/**键盘快捷键绑定 */
const keyboardMap = {
  'command+shift+i': 'toggleDevTools',
};

// 绑定键盘事件
export function bindKeyboardEvent() {
  Object.keys(keyboardMap).forEach((key) => {
    Mousetrap.bind(key, () => {
      ipcHelperUtil.ipcRun(keyboardMap[key]);
    });
  });
}
