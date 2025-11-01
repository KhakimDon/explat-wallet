<template>
  <Card>
    <CardHeader>
      <CardTitle>Баланс</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-center space-y-2">
        <div class="text-4xl font-bold">{{ balanceFormatted }} USDT</div>
        <div v-if="address" class="text-sm text-muted-foreground font-mono">
          {{ address }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'

const { address, balanceFormatted } = useWallet()
</script>

