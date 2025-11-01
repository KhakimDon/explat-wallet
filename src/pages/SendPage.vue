<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center gap-4">
          <Button @click="goBack" variant="ghost">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </Button>
          <div>
            <h1 class="text-3xl font-bold">Отправить USDT</h1>
            <p class="text-muted-foreground mt-1">Перевод USDT (TRC20) на Tron</p>
          </div>
        </div>
      </header>

      <Card class="shadow-lg">
        <CardHeader>
          <CardTitle>Детали перевода</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Отправитель -->
          <div>
            <Label class="text-sm font-semibold mb-2 block">От</Label>
            <div class="p-3 bg-muted rounded-lg border">
              <div class="font-mono text-sm break-all">{{ address || 'Загрузка...' }}</div>
            </div>
            <p class="text-xs text-muted-foreground mt-1">Ваш адрес кошелька</p>
          </div>

          <!-- Получатель -->
          <div>
            <Label for="to" class="text-sm font-semibold mb-2 block">Кому</Label>
            <Input
              id="to"
              v-model="toAddress"
              placeholder="Введите адрес получателя Tron"
              class="font-mono"
            />
            <p class="text-xs text-muted-foreground mt-1">Адрес Tron получателя</p>
          </div>

          <!-- Сумма -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <Label for="amount" class="text-sm font-semibold">Сумма</Label>
              <span class="text-xs text-muted-foreground">Доступно: {{ balanceFormatted }} USDT</span>
            </div>
            <Input
              id="amount"
              v-model="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
            <p class="text-xs text-muted-foreground mt-1">Введите сумму для отправки</p>
          </div>

          <!-- Информация о комиссии -->
          <div class="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="flex-1 space-y-2">
                <div>
                  <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">Комиссия за перевод</p>
                  <p class="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Комиссия оплачивается в TRX (нативная валюта Tron) и списывается автоматически с вашего баланса TRX. Обычно составляет ~1-2 TRX.
                  </p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-700">
                  <span class="text-xs text-amber-700 dark:text-amber-300">Ваш баланс TRX:</span>
                  <span class="text-xs font-mono font-semibold text-amber-900 dark:text-amber-100">{{ trxBalanceFormatted }} TRX</span>
                </div>
                <div v-if="trxBalance < 2" class="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                  <div class="text-xs text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Недостаточно TRX для комиссии! Минимум 2 TRX рекомендуется.
                  </div>
                  <div>
                    <button 
                      @click="showTopUpInfo = !showTopUpInfo"
                      class="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Как пополнить TRX?
                    </button>
                    <div v-if="showTopUpInfo" class="mt-2 space-y-2 text-xs text-amber-700 dark:text-amber-300">
                      <p class="font-semibold">Способы пополнения:</p>
                      <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Купить на биржах (Binance, OKX, Bybit)</li>
                        <li>Обменять USDT на TRX через биржу</li>
                        <li>Перевести TRX с другого кошелька</li>
                      </ul>
                      <p class="pt-1">Отправьте TRX на ваш адрес:</p>
                      <div class="p-2 bg-amber-100 dark:bg-amber-900 rounded text-xs font-mono break-all">
                        {{ address }}
                      </div>
                      <Button 
                        @click="handleCopyAddressForTopUp" 
                        variant="outline" 
                        size="sm" 
                        class="w-full text-xs"
                      >
                        <svg v-if="!copiedAddress" class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ copiedAddress ? 'Скопировано!' : 'Скопировать адрес для пополнения' }}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопка отправки -->
          <Button
            @click="handleSend"
            :disabled="isLoading || !toAddress || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || trxBalance < 2"
            class="w-full"
            size="lg"
          >
            <svg v-if="!isLoading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <svg v-else class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Отправка...' : 'Отправить USDT' }}
          </Button>

          <!-- Успешная транзакция -->
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="txid" class="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-semibold text-green-700 dark:text-green-300">Транзакция успешно отправлена!</span>
              </div>
              <div class="p-3 bg-background rounded border">
                <Label class="text-xs text-muted-foreground">Transaction ID:</Label>
                <div class="font-mono text-sm break-all mt-1">{{ txid }}</div>
              </div>
              <div class="flex gap-2">
                <Button @click="viewOnTronscan" variant="outline" class="flex-1" size="sm">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  Открыть в Tronscan
                </Button>
                <Button @click="goToDashboard" variant="outline" class="flex-1" size="sm">
                  Вернуться
                </Button>
              </div>
            </div>
          </transition>

          <!-- Ошибки -->
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="error" class="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-start gap-3">
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="flex-1">{{ error }}</span>
            </div>
          </transition>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { useWallet } from '@/composables/useWallet'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const router = useRouter()
const { address, balance, balanceFormatted, trxBalance, trxBalanceFormatted, isLoading, error: walletError, sendUSDT, loadWalletInfo } = useWallet()
const { copy, isSupported } = useClipboard()

const toAddress = ref('')
const amount = ref('')
const txid = ref<string | null>(null)
const error = ref<string | null>(null)
const showTopUpInfo = ref(false)
const copiedAddress = ref(false)

watch(walletError, (newError) => {
  error.value = newError
})

const handleSend = async () => {
  if (!toAddress.value || !amount.value) return
  
  const amountNum = parseFloat(amount.value)
  if (amountNum <= 0 || amountNum > balance.value) return

  error.value = null
  txid.value = null

  try {
    const result = await sendUSDT(toAddress.value, amountNum)
    if (result) {
      txid.value = result
      toAddress.value = ''
      amount.value = ''
      await loadWalletInfo() // Обновляем баланс
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка при отправке USDT'
  }
}

const goBack = () => {
  router.push({ name: 'dashboard' })
}

const goToDashboard = () => {
  txid.value = null
  router.push({ name: 'dashboard' })
}

const viewOnTronscan = () => {
  if (txid.value) {
    window.open(`https://tronscan.org/#/transaction/${txid.value}`, '_blank', 'noopener,noreferrer')
  }
}

const handleCopyAddressForTopUp = async () => {
  if (address.value) {
    if (isSupported.value) {
      await copy(address.value)
      copiedAddress.value = true
      setTimeout(() => {
        copiedAddress.value = false
      }, 2000)
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = address.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copiedAddress.value = true
      setTimeout(() => {
        copiedAddress.value = false
      }, 2000)
    }
  }
}
</script>

