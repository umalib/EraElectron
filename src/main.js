import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from '@/renderer/app.vue';

createApp(App).use(ElementPlus).mount('#app');
