import { ref, computed } from 'vue'
import { tronWebService, type WalletInfo } from '@/services/tronWebService'
import { resetWalletInit } from '@/router'

// Глобальное состояние для синхронизации между всеми компонентами
const walletInfo = ref<WalletInfo | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const isConnected = ref(false)

export function useWallet() {

  const address = computed(() => walletInfo.value?.address || null)
  const balance = computed(() => walletInfo.value?.balance || 0)
  const balanceFormatted = computed(() => walletInfo.value?.balanceFormatted || '0.00')
  const trxBalance = computed(() => walletInfo.value?.trxBalance || 0)
  const trxBalanceFormatted = computed(() => walletInfo.value?.trxBalanceFormatted || '0.000000')

  const init = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    try {
      const success = await tronWebService.init()
      if (success) {
        // Проверяем, подключен ли кошелёк в сервисе (включая восстановленный)
        const serviceConnected = tronWebService.getIsConnected()
        isConnected.value = serviceConnected
        
        // Если кошелёк подключен, загружаем информацию
        if (serviceConnected) {
          await loadWalletInfo()
          // Ещё раз проверяем после загрузки
          const finalStatus = tronWebService.getIsConnected() || !!walletInfo.value
          isConnected.value = finalStatus
          return finalStatus
        }
      }
      return isConnected.value
    } catch (err: any) {
      error.value = err.message || 'Ошибка инициализации'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const connect = async () => {
    isLoading.value = true
    error.value = null
    try {
      const success = await tronWebService.connectTronLink()
      if (success) {
        isConnected.value = true
        await loadWalletInfo()
      } else {
        error.value = 'Не удалось подключиться к TronLink'
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка подключения'
    } finally {
      isLoading.value = false
    }
  }

  const loadWalletInfo = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Проверяем статус подключения в сервисе
      const connected = tronWebService.getIsConnected()
      if (connected) {
        const info = await tronWebService.getWalletInfo()
        walletInfo.value = info
        isConnected.value = true
      } else {
        walletInfo.value = null
        isConnected.value = false
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки информации о кошельке'
      // При ошибке проверяем статус подключения в сервисе
      isConnected.value = tronWebService.getIsConnected()
    } finally {
      isLoading.value = false
    }
  }

  const sendUSDT = async (to: string, amount: number) => {
    isLoading.value = true
    error.value = null
    try {
      const txid = await tronWebService.sendUSDT(to, amount)
      await loadWalletInfo() // Обновляем баланс после отправки
      return txid
    } catch (err: any) {
      error.value = err.message || 'Ошибка при отправке USDT'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const generateWallet = async () => {
    isLoading.value = true
    error.value = null
    try {
      const wallet = await tronWebService.generateWallet()
      return wallet
    } catch (err: any) {
      error.value = err.message || 'Ошибка при создании кошелька'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const importWallet = async (privateKey: string) => {
    isLoading.value = true
    error.value = null
    try {
      await tronWebService.importWallet(privateKey)
      // Устанавливаем флаг подключения
      isConnected.value = tronWebService.getIsConnected()
      // Загружаем информацию о кошельке
      await loadWalletInfo()
      // Ещё раз проверяем статус после загрузки
      isConnected.value = tronWebService.getIsConnected()
    } catch (err: any) {
      error.value = err.message || 'Ошибка при импорте кошелька'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const disconnect = () => {
    tronWebService.disconnect()
    walletInfo.value = null
    isConnected.value = false
    error.value = null
    isLoading.value = false
    
    // Сбрасываем кэш инициализации в роутере
    resetWalletInit()
  }

  return {
    walletInfo,
    isLoading,
    error,
    isConnected,
    address,
    balance,
    balanceFormatted,
    trxBalance,
    trxBalanceFormatted,
    init,
    connect,
    disconnect,
    loadWalletInfo,
    sendUSDT,
    generateWallet,
    importWallet,
  }
}

