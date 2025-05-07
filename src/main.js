import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/scss/bootstrap.scss'
//import VueSidebarMenu from 'vue-sidebar-menu'
//import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

import './assets/dashboard.css'

const app = createApp(App)

app.use(router)
//app.use(VueSidebarMenu)

console.log('Start App !')

app.mount('#app')
