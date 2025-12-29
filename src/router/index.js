import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabaseClient'
import Auth from '../views/Auth.vue'
import Dashboard from '../views/Dashboard.vue'
import NewProject from '../views/NewProject.vue'

const routes = [
    { path: '/', component: Auth },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/new-project', component: NewProject, meta: { requiresAuth: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    const { data: { session } } = await supabase.auth.getSession()

    if (to.meta.requiresAuth && !session) {
        next('/')
    } else if (to.path === '/' && session) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
