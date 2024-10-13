<template>
  <div class="chat-container" ref="ChatBoxRef" @scroll="handleChatBoxScroll">
    <div class="chat-box">
      <div v-if="!messages.length" class="chat-box__tip">
        <h4 class="title">👏🏻欢迎使用！在下方输入框输入提问</h4>
        <div class="item"><code>alt+c</code>配置页</div>
        <div class="item"><code>alt+h</code>首页</div>
        <div class="item"><code>alt+/</code>聊天列表页</div>
        <div class="item"><code>alt+.</code>切换主窗口显示隐藏（全局快捷键）</div>
      </div>
      <div
        class="message"
        v-for="msg in messages"
        :key="msg.id"
        :class="{ 'bot-message': msg.role === 'assistant', 'user-message': msg.role === 'user' }"
      >
        <template v-if="msg.role === 'user'">{{ msg.content }}</template>
        <template v-if="msg.role === 'assistant'">
          <MarkdownRender :source="msg.content"></MarkdownRender>
        </template>
      </div>
    </div>
    <div :style="{ height: `${boxPaddingBottom}px` }"></div>
    <div class="input-box">
      <textarea
        v-model="userInput"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @keydown.enter="handleTextareaEnter"
        rows="1"
        placeholder="Type a message..."
        @input="handleQuestionInput"
        ref="QuestionTextareaRef"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { fetchStream } from '../utils/fetch.util';
import { generateRandomString } from '../utils/string.util';
import MarkdownRender from '../components/MarkdownRender.vue';

import ipcHelperUtil from '../utils/ipc-helper.util';
import Mousetrap from 'mousetrap';
import { useChatConfig } from '../hooks/config.hook';

import { useRoute } from 'vue-router';
const route = useRoute();

import { useRouter } from 'vue-router';
import { CommonUtil } from '../utils/common.util';
const router = useRouter();

const { currentConfig } = useChatConfig();
const { apiKey, baseUrl } = currentConfig.value;

// 定义消息类型
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

// 消息列表
const messages = ref<Message[]>([]);
watch(
  () => messages.value,
  () => {
    localStorage.setItem('messages', JSON.stringify(messages.value));
    if (isAutoScroll.value && ChatBoxRef.value) {
      nextTick(() => {
        const scrollHeight = ChatBoxRef.value?.scrollHeight || 10000;
        window.scroll(0, scrollHeight);
      });
    }
  },
);

// 主容器底部占位
const boxPaddingBottom = ref(66);
const handleQuestionInput = (ev) => {
  const textarea = ev.srcElement;
  const textareaScrollHeight = textarea.scrollHeight;
  textarea.style.height = textareaScrollHeight - 20 + 'px';
  boxPaddingBottom.value = textareaScrollHeight + 30;
};

const ChatBoxRef = ref<HTMLElement | null>(null); // 消息列表的引用
const isAutoScroll = ref(true); // 是否自动滚动
const handleChatBoxScroll = () => {
  const scrollTop = ChatBoxRef.value?.scrollTop || 0;
  const scrollHeight = ChatBoxRef.value?.scrollHeight || 0;
  const clientHeight = ChatBoxRef.value?.clientHeight || 0;

  // 判断是否接近底部
  isAutoScroll.value = scrollTop + clientHeight >= scrollHeight - 50; // 允许50px的误差
};

let focusOrBlurRemover: null | Function = null;
const QuestionTextareaRef = ref();
const currentChatId = ref('');

const storeCurrentChat = () => {
  // 新增话题前，将当前话题存入历史记录
  let chatId = currentChatId.value || generateRandomString(20);
  let historyList: any[] = [];
  const localHistoryList = localStorage.getItem('chat_history');
  if (localHistoryList) {
    historyList = JSON.parse(localHistoryList);
  }

  const matchItemIndex = historyList.findIndex((item) => item.id === chatId);
  if (matchItemIndex !== -1) {
    historyList[matchItemIndex] = {
      ...historyList[matchItemIndex],
      messages: messages.value,
    };
  } else {
    const now = Date.now();
    historyList.unshift({
      id: chatId,
      crateTime: CommonUtil.fmtDate(now),
      createTimestamp: now,
      messages: messages.value,
    });
  }

  localStorage.setItem('chat_history', JSON.stringify(historyList));
};

onMounted(() => {
  const queryId = route.query.id as string;
  if (!queryId) {
    currentChatId.value = generateRandomString(18);
    router.push({
      path: '/',
      query: {
        id: currentChatId.value,
      },
    });
    return;
  }
  if (queryId) {
    currentChatId.value = queryId;
    const localHistory = localStorage.getItem('chat_history');
    if (localHistory) {
      const list = JSON.parse(localHistory);
      const matchItem = list.find((item) => item.id === queryId);
      if (matchItem) {
        messages.value = matchItem.messages;
      } else {
        router.replace('/');
      }
    }
  }

  // 监听窗体窗口事件
  focusOrBlurRemover = ipcHelperUtil.addMainEventListener('winFocusOrBlur', (ev) => {
    if (ev.blur) {
      QuestionTextareaRef.value?.blur();
    } else if (ev.focus) {
      QuestionTextareaRef.value?.focus();
    }
  });

  nextTick(() => {
    QuestionTextareaRef.value?.focus();
  });

  Mousetrap.bind('command+n', () => {
    console.log('新增话题', 'chat.vue::123行');

    currentChatId.value = generateRandomString(18);
    router.push({
      path: '/',
      query: {
        id: currentChatId.value,
      },
    });
    // storeCurrentChat();
    // currentChatId.value = '';
    // messages.value = [];
    // QuestionTextareaRef.value?.focus();
  });
});

onBeforeUnmount(() => {
  focusOrBlurRemover && focusOrBlurRemover();
  if (currentChatId.value && messages.value.length) {
    storeCurrentChat();
  }
});

// 用户输入
const userInput = ref<string>('');
const isComposing = ref(false);
const handleCompositionStart = () => {
  isComposing.value = true;
};
const handleCompositionEnd = () => {
  isComposing.value = false;
};

const handleTextareaEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (isComposing.value) {
      // 在中文输入模式下按下 Enter，不执行操作
      event.preventDefault();
    } else {
      event.preventDefault();
      sendMessage();
    }
  }
};
// 发送消息逻辑
const sendMessage = async (): Promise<void> => {
  const text = userInput.value.trim();
  if (!text) return;

  // 添加用户消息到列表
  messages.value.push({ role: 'user', content: text, id: generateRandomString() });

  // 清空输入框
  userInput.value = '';

  fetchBotResponse(text);
  messages.value.push({ role: 'assistant', content: `AI思考中...`, id: generateRandomString() });
};

// 定义API响应的类型
interface BotResponse {
  reply: string;
}

const updateLatestMessageInfo = (answerData: string) => {
  if (!answerData) return;
  const messageList = messages.value;

  const _prevMessages = messageList.slice(0, -1);
  const _latestMessage = messageList[messageList.length - 1];
  messages.value = [..._prevMessages, { ..._latestMessage, content: answerData }];
};

const fetchBotResponse = async (message: string): Promise<string> => {
  let answerResult = '';
  const streamCallback = (streamData: string) => {
    if (streamData.startsWith('data:')) {
      let dataArr = streamData.split('data:');
      dataArr = dataArr.filter((item) => item !== '');
      dataArr.forEach((item) => {
        if (!item.includes('[DONE]')) {
          item = item.replace(': OPENROUTER PROCESSING', '');
          try {
            const jsonItem = JSON.parse(item);
            const content = jsonItem?.choices[0]?.delta?.content || '';
            answerResult += content;
          } catch (error) {
            console.log(error, 'App.tsx::87行');
          }
        }
      });

      updateLatestMessageInfo(answerResult);
    }
  };
  fetchStream(
    `${baseUrl}/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        stream: true,
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: '使用中文', id: generateRandomString() },
          ...messages.value,
        ],
      }),
    },
    streamCallback,
  );

  return 'hello answer';
};
</script>

<style scoped lang="scss">
// @import 'highlight.js/styles/github.css';
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  // height: 100vh;
  margin: 0 auto;
  // overflow-y: auto;
  background-color: #fff;
  border-radius: 10px;
}

.chat-box {
  flex-grow: 1;
  padding: 10px 0;
  // overflow-y: auto;

  &__tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    .title {
      margin-bottom: 12px;
    }
    .item {
      margin-bottom: 8px;
      color: #666;
      font-size: 14px;
      code {
        margin-right: 4px;
        padding: 2px 4px;
        color: #0d0d0d;
        background-color: #ececec;
        border-radius: 4px;
      }
    }
  }
}

.message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

.user-message {
  align-self: flex-end;
  margin-right: 10px;
  margin-left: 10px;
  background-color: #f4f4f4;
}

.bot-message {
  align-self: flex-start;
  box-sizing: border-box;
  max-width: 100%;
  padding: 0;
  overflow: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.input-box {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  background-color: #fff;
  border-top: 1px solid #ddd;
  textarea {
    flex-grow: 1;
    padding: 10px;
    overflow: hidden;
    color: #666;
    background: none;
    border: none;
    outline: none;
    resize: none;
  }
}

button {
  margin-left: 10px;
  padding: 10px 15px;
  color: white;
  background-color: #4caf50;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
.markdown {
  overflow: hidden;
}
</style>
