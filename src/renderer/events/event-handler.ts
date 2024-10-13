/**
 * 定义的方法供electron的main进程调用
 * ElectronUtil.sendMessage2Render(action,config)
 * 其中action为对应的方法名，config为参数值（不支持function）
 */
import { ElMessage } from 'element-plus'

import { CommonUtil } from '../utils/common.util'

import pinia from '../stores/stores'
import { useVersionStore } from "../stores/version";
import { toRefs } from 'vue';
const { updateAppVersionInfo } = toRefs(
    useVersionStore(pinia)
);

/**打印信息 */
export function consoleLog(result) {
    let msgStr = '%c[electron::console]\n'
    if (Array.isArray(result)) {
        msgStr += result.join("\n")
    }
    console.log(msgStr, 'color: #FFA500')
}

/**提示信息 */
export function showNotice(result) {
    ElMessage(result)
}

export function getElectronAppConfig(result) {
    console.log(result, "listener.ts::19行");
}

export function electronUpdaterMessage(res) {
    console.log(res, "event-handler.ts::35行");
    let { key, msg, data } = res;
    let msgTitle = "";
    // 如果有更新的版本可用
    if (key === "updateAvailable") {
        let { version, releaseDate } = data;
        releaseDate = CommonUtil.fmtDate(releaseDate, "yyyy-MM-dd hh:mm:ss");
        msgTitle = `有新的版本（${version}）可以使用，更新时间为：${releaseDate}，是否现在下载更新？`;
    }
    if (key === "updateDownloaded") {
        msgTitle = "新的版本已经下载完毕，是否现在重启安装？";
    }
    if (key === "downloadProgress") {
        msgTitle =
            "程序包下载中，可以点击隐藏按钮关掉弹窗，在下载成功后会弹出安装提示...";
    }
    if (key === "updateNotAvailable") {
        updateAppVersionInfo.value({
            key: "updateNotAvailable",
        });
        return;
    }

    if (!msgTitle) return;
    updateAppVersionInfo.value({
        key,
        visible: true,
        title: "版本提示",
        content: msgTitle,
        percentage: data && data.percent ? data.percent.toFixed(2) : 0,
    });
}