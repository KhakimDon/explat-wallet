<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <header class="mb-10 text-center">
        <div class="inline-flex items-center justify-center mb-4">
          <img :src="logo" alt="Logo" class="w-20 rounded-xl h-20 object-contain" />
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Explat Wallet
        </h1>
        <p class="text-center text-muted-foreground text-base mt-2">
          Кошелёк для работы с USDT (TRC20) на Tron
        </p>
      </header>

      <WalletConnection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables/useWallet'
import WalletConnection from '@/components/WalletConnection.vue'
import logo from '@/assets/Group 59.png'

const router = useRouter()
const { isConnected, init } = useWallet()

// Инициализируем при монтировании
onMounted(async () => {
  await init()
  await nextTick()
  if (isConnected.value) {
    router.push({ name: 'dashboard' })
  }
})

// Перенаправляем на dashboard при подключении
watch(isConnected, (connected) => {
  if (connected) {
    router.push({ name: 'dashboard' })
  }
}, { immediate: false })
</script>

