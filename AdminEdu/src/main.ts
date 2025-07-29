import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import myVueplugin from './plugins/vueplugin'
import Watermark from './plugins/watermark'
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:3008'

// 创建应用实例
const app = createApp(App)

// 创建并配置 Pinia
const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 先使用 Pinia再使用路由
app.use(pinia)

// 使用路由
app.use(router)

// 使用 Element Plus
app.use(ElementPlus)

// 注册权限指令
app.use(myVueplugin)

// 注册水印插件
app.use(Watermark)

// 挂载应用
app.mount('#app')