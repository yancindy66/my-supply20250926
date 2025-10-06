
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.css';
import { applyThemeForRole } from './roles/config';
import { initCapabilities } from './store/capabilities';

const app = createApp(App);
app.use(router);
app.use(i18n);
app.use(ElementPlus);
initCapabilities().finally(()=>{
  app.mount('#app');
});

// 应用按角色主题（对齐登录页浅色蓝灰玻璃风）
try { applyThemeForRole(localStorage.getItem('role')); } catch {}
