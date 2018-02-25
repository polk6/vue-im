// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { imServerStore } from './store/imServerStore.js';

// element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI);

// config
Vue.config.productionTip = false

/* eslint-disable no-new */
window.polkVue = new Vue({
    el: '#app',
    router,
    components: { App },
    store: {
        imServerStore: imServerStore
    },
    template: '<App/>'
})