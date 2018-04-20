import Vue from 'vue'
import Router from 'vue-router'
import imServerIndex from '@/components/imServer/imServerIndex'
import imClientIndex from '@/components/imClient/imClientIndex'
import imClient_geely from '@/components/imClient-geely/imClientIndex'

Vue.use(Router)

export default new Router({
    routes: [
        { path: '/', redirect: 'imServer' },
        { path: '/imServer', name: 'imServer', component: imServerIndex },
        { path: '/imClient', name: 'imClient', component: imClientIndex },
        { path: '/imClient-geely', name: 'imClient-geely', component: imClient_geely },
    ]
})