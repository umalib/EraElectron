import { createRouter, createWebHashHistory } from 'vue-router';
import GameMain from '../views/game-main.vue';

const routes = [
  {
    path: '/',
    name: 'Game',
    component: GameMain,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/game-copyright.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
