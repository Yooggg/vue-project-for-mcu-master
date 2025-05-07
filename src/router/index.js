import { createRouter, createWebHistory } from 'vue-router'
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
      path: '/charts',
      name: 'charts',
      component: () => import('../views/ChartsView.vue'), props: { caption: 'Charts' }
      // component: ChartTView, props: { caption: 'График изменения температуры' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    }
  ]
})

// router.beforeEach((to, from, next) => {
//   console.log(`before Each = ${to.path}`)
//   next()  
// })

export default router
