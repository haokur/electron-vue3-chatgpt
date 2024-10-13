<template>
  <div class="markdown" v-html="renderedMarkdown"></div>
</template>

<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js'; // 导入 highlight.js
import 'highlight.js/styles/github.css'; // 导入代码高亮的样式

// 定义 props 接收 markdown 内容
const props = defineProps({
  source: {
    type: String,
    required: true,
  },
});

// 创建 markdown-it 实例
const markdownParser = new MarkdownIt({
  highlight: function (str, lang) {
    if (['bash'].includes(lang)) {
      lang = 'powershell';
    }
    if (['vue'].includes(lang)) {
      lang = 'xml';
    }
    if (['jsx'].includes(lang)) {
      lang = 'typescript';
    }
    if (lang === 'vue<script>') {
      lang = 'xml';
      str = '<script>\n' + str;
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`;
      } catch (_) {}
    }
    return `<pre class="hljs"><code>${markdownParser.utils.escapeHtml(str)}</code></pre>`;
  },
});

// 计算转换后的 HTML
const renderedMarkdown = computed(() => {
  return markdownParser.render(props.source);
});
</script>
