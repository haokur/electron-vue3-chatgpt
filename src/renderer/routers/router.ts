import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: () => import('../views/chat.vue'),
  },
  {
    path: '/chat-setting',
    name: 'ChatSetting',
    component: () => import('../views/chat-setting.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
