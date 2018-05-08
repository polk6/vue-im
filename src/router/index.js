import Vue from 'vue'
import Router from 'vue-router'
import imServerIndex from '@/components/imServer/imServerIndex'
import imClientIndex from '@/components/imClient/imClientIndex'

Vue.use(Router)

export default new Router({
    routes: [
        { path: '/', redirect: 'imServer' },
        { path: '/imServer', name: 'imServer', component: imServerIndex },
        { path: '/imClient', name: 'imClient', component: imClientIndex },
    ]
})