import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _ec19a6f0 = () => interopDefault(import('..\\pages\\profile.vue' /* webpackChunkName: "pages/profile" */))
const _2fecb609 = () => interopDefault(import('..\\pages\\signup.vue' /* webpackChunkName: "pages/signup" */))
const _0d77a683 = () => interopDefault(import('..\\pages\\hashtag\\_id\\index.vue' /* webpackChunkName: "pages/hashtag/_id/index" */))
const _da0aa38e = () => interopDefault(import('..\\pages\\post\\_id.vue' /* webpackChunkName: "pages/post/_id" */))
const _2fbae429 = () => interopDefault(import('..\\pages\\post\\_id\\index.vue' /* webpackChunkName: "pages/post/_id/index" */))
const _e980fd58 = () => interopDefault(import('..\\pages\\user\\_id\\index.vue' /* webpackChunkName: "pages/user/_id/index" */))
const _9d66d61e = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/profile",
    component: _ec19a6f0,
    name: "profile"
  }, {
    path: "/signup",
    component: _2fecb609,
    name: "signup"
  }, {
    path: "/hashtag/:id",
    component: _0d77a683,
    name: "hashtag-id"
  }, {
    path: "/post/:id?",
    component: _da0aa38e,
    children: [{
      path: "",
      component: _2fbae429,
      name: "post-id"
    }]
  }, {
    path: "/user/:id",
    component: _e980fd58,
    name: "user-id"
  }, {
    path: "/",
    component: _9d66d61e,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
