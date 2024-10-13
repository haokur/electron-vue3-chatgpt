import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useVersionStore = defineStore('updaterAppInfo', () => {
  const updaterAppInfo = ref({
    // 当前工作状态，available有新版本可用，download下载中，
    // downloaded下载已完成，install安装中
    wip: '',
    visible: false,
    key: 'updateAvailable',
    title: '版本提示',
    content: '有新的版本可以使用，是否现在下载更新？',
    percentage: 0,
  });

  const updateAppVersionInfo = (config) => {
    console.log(config, 'version.ts::17行');
    updaterAppInfo.value = {
      ...updaterAppInfo.value,
      ...config,
    };
  };

  return { updaterAppInfo, updateAppVersionInfo };
});
