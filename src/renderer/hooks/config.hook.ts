import { ref } from 'vue';

export const useChatConfig = () => {
  const currentConfig = ref({
    baseUrl: '',
    apiKey: '',
  });

  const localConfig = localStorage.getItem('chat_config');
  if (localConfig) {
    const localChatConfig = JSON.parse(localConfig);
    currentConfig.value = localChatConfig;
  } else {
    const baseUrl = import.meta.env.VITE_CHAT_BASE_URL;
    const apiKey = import.meta.env.VITE_CHAT_API_KEY;
    currentConfig.value = {
      baseUrl,
      apiKey,
    };
    localStorage.setItem('chat_config', JSON.stringify(currentConfig.value));
  }

  const updateConfig = (config) => {
    localStorage.setItem('chat_config', JSON.stringify(config));
  };

  return {
    currentConfig,
    updateConfig,
  };
};
