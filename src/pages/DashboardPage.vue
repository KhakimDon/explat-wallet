<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Кошелёк</h1>
            <p class="text-muted-foreground mt-1">Управление балансом и адресом</p>
          </div>
          <Button @click="handleDisconnect" variant="outline" size="sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Отключить
          </Button>
        </div>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Баланс -->
        <Card class="shadow-lg">
          <CardHeader>
            <CardTitle>Баланс USDT</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-center space-y-4">
              <div class="text-5xl font-bold">{{ balanceFormatted }}</div>
              <div class="text-lg text-muted-foreground">USDT</div>
              <Button @click="handleRefresh" :disabled="isLoading" variant="outline" class="w-full">
                <svg v-if="!isLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <svg v-else class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Обновление...' : 'Обновить баланс' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Адрес -->
        <Card class="shadow-lg">
          <CardHeader>
            <CardTitle>Адрес кошелька</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="p-4 bg-muted rounded-lg border">
                <div class="font-mono text-sm break-all text-center">{{ address || 'Загрузка...' }}</div>
              </div>
              <p class="text-xs text-muted-foreground text-center">
                Этот адрес используется для получения TRX и USDT (TRC20)
              </p>
              <div class="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">Баланс TRX</span>
                  <span class="text-sm font-mono text-blue-900 dark:text-blue-100">{{ trxBalanceFormatted }} TRX</span>
                </div>
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">Используется для оплаты комиссий</p>
                <div v-if="trxBalance < 2" class="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                  <button 
                    @click="showTopUpInfo = !showTopUpInfo"
                    class="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium flex items-center gap-1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Как пополнить TRX?
                  </button>
                  <div v-if="showTopUpInfo" class="mt-2 space-y-2 text-xs text-blue-700 dark:text-blue-300">
                    <p class="font-semibold">Способы пополнения:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                      <li>Купить на биржах (Binance, OKX, Bybit)</li>
                      <li>Обменять USDT на TRX через биржу</li>
                      <li>Перевести TRX с другого кошелька</li>
                    </ul>
                    <p class="pt-1">Отправьте TRX на ваш адрес:</p>
                    <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono break-all">
                      {{ address }}
                    </div>
                    <Button 
                      @click="handleCopyAddress" 
                      variant="outline" 
                      size="sm" 
                      class="w-full text-xs"
                    >
                      Скопировать адрес для пополнения
                    </Button>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <Button @click="handleCopyAddress" variant="outline" class="flex-1">
                  <svg v-if="!copied" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ copied ? 'Скопировано!' : 'Копировать' }}
                </Button>
                <Button @click="handleViewOnTronscan" variant="outline" class="flex-1">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  Tronscan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Быстрые действия -->
      <div class="mt-6">
        <Card class="shadow-lg">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <Button @click="goToSend" class="w-full" size="lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              Отправить USDT
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Ошибки -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="error" class="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-start gap-3">
          <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="flex-1">{{ error }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { useWallet } from '@/composables/useWallet'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const { address, balanceFormatted, trxBalance, trxBalanceFormatted, isLoading, error, loadWalletInfo, disconnect } = useWallet()

const { copy, isSupported } = useClipboard()
const copied = ref(false)
const showTopUpInfo = ref(false)

const handleRefresh = async () => {
  await loadWalletInfo()
}

const handleDisconnect = () => {
  disconnect()
  router.push({ name: 'login' })
}

const handleCopyAddress = async () => {
  if (address.value) {
    if (isSupported.value) {
      await copy(address.value)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = address.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }
}

const handleViewOnTronscan = () => {
  if (address.value) {
    window.open(`https://tronscan.org/#/address/${address.value}`, '_blank', 'noopener,noreferrer')
  }
}

const goToSend = () => {
  router.push({ name: 'send' })
}
</script>

