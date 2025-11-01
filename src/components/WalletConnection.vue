<template>
  <Card class="shadow-lg">
    <CardHeader class="pb-4">
      <CardTitle class="text-xl font-semibold">Подключение кошелька</CardTitle>
      <p class="text-sm text-muted-foreground mt-1">
        Создайте новый кошелёк или импортируйте существующий
      </p>
    </CardHeader>
    <CardContent class="space-y-6">
      <div v-if="!isConnected" class="space-y-6">
        <!-- Опции кошелька -->
        <div class="space-y-3">
          <Button 
            @click="showCreate = !showCreate" 
            variant="outline" 
            class="w-full h-12 text-base font-medium border-2 hover:border-primary/50 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Создать новый кошелёк
          </Button>
          <Button 
            @click="showImport = !showImport" 
            variant="outline" 
            class="w-full h-12 text-base font-medium border-2 hover:border-primary/50 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Импортировать кошелёк
          </Button>
        </div>

        <!-- Создание кошелька -->
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showCreate" class="p-5 border-2 rounded-xl bg-muted/30 space-y-4">
            <div v-if="newWallet" class="space-y-4">
              <div class="p-4 bg-background border rounded-lg space-y-2">
                <Label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Адрес кошелька</Label>
                <div class="font-mono text-sm break-all p-2 bg-muted rounded border">{{ newWallet.address }}</div>
              </div>
              <div class="p-4 bg-background border rounded-lg space-y-2">
                <div class="flex items-center justify-between">
                  <Label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Приватный ключ</Label>
                  <span class="text-xs text-destructive font-medium">⚠️ Сохраните безопасно!</span>
                </div>
                <div class="font-mono text-sm break-all p-2 bg-muted rounded border text-foreground">{{ newWallet.privateKey }}</div>
              </div>
              <Button @click="handleImportNewWallet" class="w-full h-11 font-medium">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Импортировать этот кошелёк
              </Button>
            </div>
            <Button 
              v-else 
              @click="handleCreateWallet" 
              :disabled="isLoading" 
              class="w-full h-11 font-medium"
            >
              <svg v-if="!isLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <svg v-else class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Создание...' : 'Создать кошелёк' }}
            </Button>
          </div>
        </transition>

        <!-- Импорт кошелька -->
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showImport" class="p-5 border-2 rounded-xl bg-muted/30 space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-semibold">Приватный ключ</Label>
              <Input
                v-model="privateKey"
                type="password"
                placeholder="Введите ваш приватный ключ"
                class="h-11 font-mono"
              />
              <p class="text-xs text-muted-foreground">
                Ваш приватный ключ никогда не будет отправлен на сервер
              </p>
            </div>
            
            <Button 
              @click="handleImportWallet" 
              :disabled="isLoading || !privateKey.trim()" 
              class="w-full h-11 font-medium"
            >
              <svg v-if="!isLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <svg v-else class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Импорт...' : 'Импортировать кошелёк' }}
            </Button>
          </div>
        </transition>
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
        <div v-if="error" class="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-start gap-3">
          <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="flex-1">{{ error }}</span>
        </div>
      </transition>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables/useWallet'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const router = useRouter()
const {
  isConnected,
  isLoading,
  error,
  generateWallet,
  importWallet,
} = useWallet()

const showCreate = ref(false)
const showImport = ref(false)
const privateKey = ref('')
const newWallet = ref<{ address: string; privateKey: string } | null>(null)

const handleCreateWallet = async () => {
  try {
    const wallet = await generateWallet()
    newWallet.value = wallet
  } catch (err) {
    // Ошибка уже обработана в composable
  }
}

const handleImportWallet = async () => {
  if (!privateKey.value) return
  try {
    await importWallet(privateKey.value)
    privateKey.value = ''
    showImport.value = false
    // Перенаправляем на dashboard после успешного импорта
    if (isConnected.value) {
      router.push({ name: 'dashboard' })
    }
  } catch (err) {
    // Ошибка уже обработана в composable
  }
}

const handleImportNewWallet = async () => {
  if (!newWallet.value) return
  try {
    await importWallet(newWallet.value.privateKey)
    newWallet.value = null
    showCreate.value = false
    // Перенаправляем на dashboard после успешного импорта
    if (isConnected.value) {
      router.push({ name: 'dashboard' })
    }
  } catch (err) {
    // Ошибка уже обработана в composable
  }
}

</script>

