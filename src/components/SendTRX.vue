<template>
  <Card>
    <CardHeader>
      <CardTitle>Отправить USDT</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div>
        <Label for="to">Адрес получателя</Label>
        <Input
          id="to"
          v-model="toAddress"
          placeholder="Введите адрес получателя Tron"
          class="mt-2 font-mono"
        />
      </div>
      <div>
        <Label for="amount">Количество USDT</Label>
        <Input
          id="amount"
          v-model="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          class="mt-2"
        />
      </div>
      <Button
        @click="handleSend"
        :disabled="isLoading || !toAddress || !amount || parseFloat(amount) <= 0"
        class="w-full"
      >
        {{ isLoading ? 'Отправка...' : 'Отправить USDT' }}
      </Button>
      
      <div v-if="txid" class="p-3 bg-muted rounded-md">
        <Label>Транзакция успешно отправлена!</Label>
        <div class="text-sm font-mono break-all mt-2">{{ txid }}</div>
        <a
          :href="`https://tronscan.org/#/transaction/${txid}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline text-sm"
        >
          Открыть в Tronscan
        </a>
      </div>

      <div v-if="error" class="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
        {{ error }}
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWallet } from '@/composables/useWallet'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const { isLoading, error: walletError, sendUSDT } = useWallet()

const toAddress = ref('')
const amount = ref('')
const txid = ref<string | null>(null)
const error = ref<string | null>(null)

watch(walletError, (newError) => {
  error.value = newError
})

const handleSend = async () => {
  if (!toAddress.value || !amount.value) return
  
  const amountNum = parseFloat(amount.value)
  if (amountNum <= 0) return

  error.value = null
  txid.value = null

  try {
    const result = await sendUSDT(toAddress.value, amountNum)
    if (result) {
      txid.value = result
      toAddress.value = ''
      amount.value = ''
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка при отправке USDT'
  }
}
</script>

