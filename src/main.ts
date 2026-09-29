import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import './theme/ciphergrid.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const app = createApp(App).use(IonicVue).use(createPinia()).use(router);
router.isReady().then(() => app.mount('#app'));
