import { createApp } from 'vue';
import App from './renderer/app.vue';
import router from './renderer/router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

createApp(App).use(ElementPlus).use(router).mount('#app');
