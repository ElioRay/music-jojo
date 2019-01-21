import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainPage',
      component: require('@/components/MainPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
