<template>
  <div class="chat-history">
    <div class="chat-history__header">
      <h3 class="title">历史记录：</h3>
      <el-button type="primary" @click="handleGoHome">返回首页</el-button>
    </div>
    <ul class="chat-list">
      <li
        class="chat-item"
        v-for="item in chatHistoryList"
        :key="item.id"
        @click="handleGoChatItem(item)"
      >
        <div class="chat-item__title">{{ item.messages[0]?.content }}</div>
        <div class="chat-item__createTime">{{ item.crateTime }}</div>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const handleGoHome = () => {
  router.push({
    path: '/',
  });
};

interface IHistoryItem {
  id: string;
  crateTime: string;
  messages: {
    content: string;
    role: string;
  }[];
}

// 聊天记录列表
const chatHistoryList = ref<IHistoryItem[]>([]);

const getChatHistory = () => {
  const localHistory = localStorage.getItem('chat_history');
  if (localHistory) {
    const list = JSON.parse(localHistory);
    chatHistoryList.value = list;
  }
};

// 获取列表
onMounted(() => {
  getChatHistory();
});

const handleGoChatItem = (item) => {
  const { id } = item;
  router.push({
    path: '/',
    query: { id },
  });
};
</script>
<style lang="scss" scoped>
.chat {
  &-history {
    padding: 20px 20px;
    .title {
      margin-right: 4px;
    }
    &__header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
  }
  &-list {
    list-style: none;
  }
  &-item {
    margin-bottom: 10px;
    padding: 10px;
    line-height: 1.4;
    background: #f4f4f4;
    border-radius: 8px;
    cursor: pointer;
    &__title {
      font-weight: 600;
      font-size: 16px;
    }
    &__createTime {
      margin-top: 4px;
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
