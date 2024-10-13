import path from 'path'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';

import { defineConfig, loadEnv } from 'vite'

// 加载 dotenv
import dotenv from 'dotenv';

const config = defineConfig(({ mode }) => {
  const sourceRootDir = path.join(__dirname, 'src', 'renderer')
  // 使用 loadEnv 手动加载指定路径的环境变量
  dotenv.config({
    path: [
      path.resolve(sourceRootDir, `./env/.env`),
      path.resolve(sourceRootDir, `./env/.env.${mode}`),
    ]
  });
  const env = loadEnv(mode, path.resolve(sourceRootDir, `./env`));

  return {
    root: sourceRootDir,
    publicDir: 'public',
    define: {
      'process.env': env,
    },
    server: {
      port: 8080,
    },
    open: false,
    build: {
      outDir: path.join(__dirname, 'build', 'renderer'),
      emptyOutDir: true,
    },
    plugins: [
      vuePlugin(),
      vueJsx()
    ],
  }
});

module.exports = config;
