import Vue from 'vue'
import Router from 'vue-router'
import imServerIndex from '@/components/imServer/imServerIndex'

Vue.use(Router)

export default new Router({
    routes: [
        { path: '/', redirect: 'imServer' },
        { path: '/imServer', name: 'imServer', component: imServerIndex },
    ]
})