<template>
  <div class="form">
    <h3 class="form-title">设置</h3>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="服务器地址">
        <el-input v-model="form.baseUrl" placeholder="填写服务器根地址" />
      </el-form-item>
      <el-form-item label="API_KEY">
        <el-input v-model="form.apiKey" type="textarea" rows="3" style="word-break: break-all" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitConfig">更新</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router = useRouter();

import { useChatConfig } from '../hooks/config.hook';
import { ref } from 'vue';
const { currentConfig, updateConfig } = useChatConfig();

const form = ref(currentConfig.value);
const submitConfig = () => {
  updateConfig(form.value);
  handleCancel();
};

const handleCancel = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.form {
  padding: 20px;
  &-title {
    margin-bottom: 10px;
  }
}
</style>
