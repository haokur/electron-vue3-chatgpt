import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
