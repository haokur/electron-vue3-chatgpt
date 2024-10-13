<template>
  <div class="App">
    <el-dialog v-model="updateModalVisible" :title="updaterInfo.title" width="30%">
      <div class="mb16">{{ updaterInfo.content }}</div>
      <div v-if="updaterInfo.wip === 'download'">
        <el-progress
          :text-inside="true"
          :stroke-width="24"
          :percentage="updaterInfo.percentage"
          status="success"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            type="primary"
            @click="downloadUpdateNow"
            v-if="updaterInfo.wip === 'available'"
          >
            开始下载
          </el-button>
          <el-button
            type="primary"
            v-if="updaterInfo.wip === 'downloaded'"
            @click="installLatestApp"
          >
            开始安装
          </el-button>
          <el-button type="primary" v-if="updaterInfo.wip === 'install'"> 安装中 </el-button>
        </span>
      </template>
    </el-dialog>
    <button @click="checkUpdate">检查更新</button>
    <button @click="toggleDevTools">点击切换控制台</button>
    <el-button @click="getElectronAppConfig">获取版本信息</el-button>

    <el-button @click="listenMainMessage">持续监听Main消息</el-button>
    <el-button @click="removeListenMainMessage">取消持续监听Main消息</el-button>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRef, toRefs } from 'vue';

import { useVersionStore } from '../stores/version';
import ipcHelperUtil from '../utils/ipc-helper.util';
const { updaterAppInfo: updaterInfo } = useVersionStore();

const updateModalVisible = ref(false);
// 检查版本更新
function watchAutoUpdateInfo() {
  ipcHelperUtil.ipcWatch('watchAutoUpdateInfo', {}, (res) => {
    const { event, data } = res;
    switch (event) {
      case 'update-available':
        updateModalVisible.value = true;
        updaterInfo.wip = 'available';
        break;
      case 'download-progress':
        // 下载进度更新
        const { bytesPerSecond, delta, percent, total, transferred } = data;
        updaterInfo.wip = 'download';
        updaterInfo.percentage = +percent.toFixed(2);
        break;
      case 'update-downloaded':
        updaterInfo.wip = 'downloaded';
        break;
      default:
        break;
    }
    console.log(res, 'Home.vue::64行');
  });
}

// 检查是否有最新的安装包
function checkUpdate() {
  ipcHelperUtil.ipcRun('checkUpdateInfo');
}

// 开始下载安装包
function downloadUpdateNow() {
  ipcHelperUtil.ipcRun('downloadLatestApp');
}

// 开始安装安装包
function installLatestApp() {
  ipcHelperUtil.ipcRun('installLatestApp');
}

const toggleDevTools = () => {
  ipcHelperUtil.ipcRun('toggleDevTools');
};

function getElectronAppConfig() {
  ipcHelperUtil.ipcRun('getAppSystemInfo', {}, (result) => {
    console.log(result, 'Home.vue::71行');
  });
}

const isListenTimestamp = ref(true);
function listenMainMessage() {
  ipcHelperUtil.ipcWatch('sendManyMsg2Render', {}, (result, remover) => {
    console.log(result.timestamp, 'Home.vue::80行');
    if (!isListenTimestamp.value) {
      remover();
    }
  });
}

function removeListenMainMessage() {
  isListenTimestamp.value = !isListenTimestamp.value;
}

onMounted(() => {
  watchAutoUpdateInfo();
});
</script>
