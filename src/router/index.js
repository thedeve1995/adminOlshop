import { createRouter, createWebHistory } from 'vue-router'
import ShopItems from '../views/ShopItems.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/shopitems',
      name: 'shopitems',
      component: ShopItems
    }
  ]
})

export default router
