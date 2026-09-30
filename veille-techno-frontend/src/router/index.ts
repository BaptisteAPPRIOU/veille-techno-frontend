import { createRouter, createWebHistory } from 'vue-router'
import BoardView from '../views/BoardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'board',
      component: BoardView,
    },
    // Login and register are only needed before signing in, so they are loaded on demand
    // and kept out of the bundle that displays the board.
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    // Any unknown URL goes back to the board instead of rendering a blank page. A path redirect
    // (not a named one) keeps the catch-all `pathMatch` param from being carried to the board.
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
