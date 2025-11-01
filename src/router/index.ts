import { createRouter, createWebHistory } from 'vue-router'
import { useWallet } from '@/composables/useWallet'
import LoginPage from '@/pages/LoginPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import SendPage from '@/pages/SendPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/send',
      name: 'send',
      component: SendPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Создаём глобальную инициализацию для избежания повторных вызовов
let initPromise: Promise<boolean> | null = null

// Функция для сброса кэша инициализации (используется при disconnect)
export function resetWalletInit() {
  initPromise = null
}

// Навигационная защита - проверяем подключение кошелька
router.beforeEach(async (to, from, next) => {
  const { isConnected, init } = useWallet()
  
  // Инициализируем только если нужно
  if (!initPromise) {
    initPromise = init()
  }
  
  // Ожидаем инициализацию
  const connected = await initPromise
  
  // Всегда проверяем актуальное состояние, не только кэшированное
  const currentConnected = connected || isConnected.value
  
  if (to.meta.requiresAuth) {
    // Для защищённых маршрутов проверяем подключение
    if (currentConnected) {
      next()
    } else {
      next({ name: 'login' })
    }
  } else {
    // Для страницы логина перенаправляем на dashboard, если подключен
    if (currentConnected && to.name === 'login') {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  }
})

export default router

