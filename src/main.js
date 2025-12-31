import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())

app.use(router)

import VueApexCharts from 'vue3-apexcharts'
app.use(VueApexCharts)

app.mount('#app')
