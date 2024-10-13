<template>
  <div class="App">
    <router-view></router-view>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import ipcHelperUtil from './utils/ipc-helper.util';

import { useRouter } from 'vue-router';
const router = useRouter();

import Mousetrap from 'mousetrap';

onMounted(() => {
  ipcHelperUtil.addMainEventListener('goPage', ({ path }) => {
    router.push({ path });
  });

  Mousetrap.bind('alt+c', () => {
    router.push({ path: '/chat-setting' });
  });
  Mousetrap.bind('alt+/', () => {
    router.push({ path: '/chat-history' });
  });
  Mousetrap.bind('alt+h', () => {
    router.push({ path: '/' });
  });
});
</script>
