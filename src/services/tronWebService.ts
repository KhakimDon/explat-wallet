import TronWeb from 'tronweb'

// USDT (TRC20) контракт на Tron Mainnet
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const USDT_DECIMALS = 6 // USDT на Tron имеет 6 десятичных знаков

export interface WalletInfo {
  address: string
  balance: number
  balanceFormatted: string
  trxBalance: number
  trxBalanceFormatted: string
}

export class TronWebService {
  private tronWeb: TronWeb | null = null
  private isConnected = false

  async init(): Promise<boolean> {
    try {
      // Сначала проверяем TronLink
      if (typeof window !== 'undefined' && window.tronWeb) {
        const tronWeb = window.tronWeb
        this.tronWeb = tronWeb
        this.isConnected = await tronWeb.isConnected()
        if (this.isConnected) {
          return true
        }
      }

      // Создаём экземпляр TronWeb
      const HttpProvider = TronWeb.providers.HttpProvider
      const fullNode = 'https://api.trongrid.io'
      const solidityNode = 'https://api.trongrid.io'
      const eventServer = 'https://api.trongrid.io'

      this.tronWeb = new TronWeb(
        new HttpProvider(fullNode),
        new HttpProvider(solidityNode),
        new HttpProvider(eventServer)
      )

      // Восстанавливаем кошелёк из sessionStorage, если есть
      if (typeof window !== 'undefined') {
        const savedPrivateKey = sessionStorage.getItem('tron_wallet_private_key')
        if (savedPrivateKey && savedPrivateKey.trim().length > 0) {
          try {
            // Устанавливаем приватный ключ
            this.tronWeb.setPrivateKey(savedPrivateKey)
            
            // Даём время на установку адреса
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Получаем адрес несколькими способами
            let address: string | null = null
            
            // Способ 1: Через defaultAddress
            if (this.tronWeb.defaultAddress) {
              const addr = this.tronWeb.defaultAddress
              if (typeof addr === 'string') {
                address = addr
              } else if (addr.base58) {
                address = addr.base58
              } else if (addr.hex) {
                address = TronWeb.address.fromHex(addr.hex)
              }
            }
            
            // Способ 2: Из приватного ключа
            if (!address && this.tronWeb.defaultPrivateKey) {
              address = TronWeb.address.fromPrivateKey(this.tronWeb.defaultPrivateKey)
            }
            
            // Если адрес получен успешно - считаем кошелёк восстановленным
            if (address && address.length > 0) {
              this.isConnected = true
              console.log('✅ Кошелёк успешно восстановлен из sessionStorage. Адрес:', address)
              return true
            } else {
              console.warn('⚠️ Не удалось получить адрес при восстановлении кошелька')
            }
          } catch (error) {
            // Если не удалось восстановить, удаляем невалидный ключ
            sessionStorage.removeItem('tron_wallet_private_key')
            console.error('Failed to restore wallet from sessionStorage:', error)
          }
        }
      }

      return true
    } catch (error) {
      console.error('Error initializing TronWeb:', error)
      return false
    }
  }

  async connectTronLink(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      if (window.tronWeb && window.tronWeb.ready) {
        this.tronWeb = window.tronWeb
        this.isConnected = await this.tronWeb.isConnected()
        
        // Если подключились через TronLink, удаляем сохранённый приватный ключ
        // (TronLink управляет ключом сам)
        if (this.isConnected && typeof window !== 'undefined') {
          sessionStorage.removeItem('tron_wallet_private_key')
        }
        
        return this.isConnected
      }

      // Запрос на подключение TronLink
      if (window.tronLink) {
        await window.tronLink.request({ method: 'tron_requestAccounts' })
        if (window.tronWeb && window.tronWeb.ready) {
          this.tronWeb = window.tronWeb
          this.isConnected = await this.tronWeb.isConnected()
          
          // Удаляем сохранённый приватный ключ при подключении через TronLink
          if (this.isConnected && typeof window !== 'undefined') {
            sessionStorage.removeItem('tron_wallet_private_key')
          }
          
          return this.isConnected
        }
      }

      return false
    } catch (error) {
      console.error('Error connecting TronLink:', error)
      return false
    }
  }

  async getAddress(): Promise<string | null> {
    if (!this.tronWeb) return null
    try {
      // Если подключен через TronLink
      if (this.isConnected && typeof window !== 'undefined' && window.tronWeb?.defaultAddress) {
        return window.tronWeb.defaultAddress.base58
      }
      
      // Если используется локальный экземпляр с приватным ключом
      // Сначала проверяем defaultAddress
      if (this.tronWeb.defaultAddress) {
        const addr = this.tronWeb.defaultAddress
        if (typeof addr === 'string' && addr.length > 0) {
          return addr
        }
        if (addr && typeof addr === 'object') {
          if (addr.base58 && typeof addr.base58 === 'string') {
            return addr.base58
          }
          if (addr.hex && typeof addr.hex === 'string') {
            return TronWeb.address.fromHex(addr.hex)
          }
        }
      }
      
      // Если defaultAddress недоступен, получаем адрес из приватного ключа
      const privateKey = this.tronWeb.defaultPrivateKey
      if (privateKey && typeof privateKey === 'string' && privateKey.length > 0) {
        try {
          const address = TronWeb.address.fromPrivateKey(privateKey)
          if (address && typeof address === 'string' && address.length > 0) {
            return address
          }
        } catch (e) {
          console.error('Error computing address from private key:', e)
        }
      }
      
      return null
    } catch (error) {
      console.error('Error getting address:', error)
      return null
    }
  }

  async getBalance(): Promise<number> {
    if (!this.tronWeb) return 0
    try {
      const address = await this.getAddress()
      if (!address) return 0

      // Получаем баланс USDT (TRC20 токен)
      const contract = await this.tronWeb.contract().at(USDT_CONTRACT_ADDRESS)
      const balance = await contract.balanceOf(address).call()
      
      // Конвертация из наименьшей единицы (с учётом decimals)
      return balance / Math.pow(10, USDT_DECIMALS)
    } catch (error) {
      console.error('Error getting USDT balance:', error)
      return 0
    }
  }

  async getTRXBalance(): Promise<number> {
    if (!this.tronWeb) return 0
    try {
      const address = await this.getAddress()
      if (!address) return 0

      // Получаем баланс TRX (нативная валюта)
      const balance = await this.tronWeb.trx.getBalance(address)
      
      // Конвертация из sun в TRX (1 TRX = 1,000,000 sun)
      return balance / 1_000_000
    } catch (error) {
      console.error('Error getting TRX balance:', error)
      return 0
    }
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    const address = await this.getAddress()
    if (!address) return null

    const [balance, trxBalance] = await Promise.all([
      this.getBalance(),
      this.getTRXBalance()
    ])
    
    return {
      address,
      balance,
      balanceFormatted: balance.toFixed(2),
      trxBalance,
      trxBalanceFormatted: trxBalance.toFixed(6),
    }
  }

  async sendUSDT(to: string, amount: number): Promise<string | null> {
    if (!this.tronWeb || !this.isConnected) {
      throw new Error('TronWeb не подключен. Пожалуйста, подключите TronLink.')
    }

    try {
      const address = await this.getAddress()
      if (!address) {
        throw new Error('Адрес кошелька не найден')
      }

      // Проверяем баланс TRX перед отправкой (нужен для комиссии)
      const trxBalance = await this.getTRXBalance()
      const minimumTRX = 2 // Минимум 2 TRX рекомендуется для комиссии
      if (trxBalance < minimumTRX) {
        throw new Error(`Недостаточно TRX для оплаты комиссии. Требуется минимум ${minimumTRX} TRX, доступно: ${trxBalance.toFixed(6)} TRX`)
      }

      // Конвертация USDT в наименьшую единицу (с учётом decimals)
      const amountInSmallestUnit = Math.floor(amount * Math.pow(10, USDT_DECIMALS))

      // Получаем экземпляр контракта USDT
      const contract = await this.tronWeb.contract().at(USDT_CONTRACT_ADDRESS)
      
      // Вызываем метод transfer токена
      // TronLink автоматически подпишет транзакцию, если используется расширение
      const result = await contract.transfer(
        to,
        amountInSmallestUnit
      ).send({
        feeLimit: 100_000_000, // Лимит комиссии в sun (100 TRX)
      })

      // Результат может быть строкой (txid) или объектом с txid
      if (typeof result === 'string') {
        return result
      }
      
      // Если это объект транзакции, извлекаем txid
      if (result && result.txid) {
        return result.txid
      }
      
      // Если это объект результата от sendRawTransaction
      if (result && typeof result === 'object' && 'txid' in result) {
        return (result as any).txid
      }

      throw new Error('Не удалось получить txid транзакции')
    } catch (error: any) {
      console.error('Error sending USDT:', error)
      throw new Error(error.message || 'Ошибка при отправке USDT')
    }
  }

  async generateWallet(): Promise<{ address: string; privateKey: string }> {
    try {
      // Создаём временный экземпляр TronWeb для генерации аккаунта
      const HttpProvider = TronWeb.providers.HttpProvider
      const fullNode = 'https://api.trongrid.io'
      const solidityNode = 'https://api.trongrid.io'
      const eventServer = 'https://api.trongrid.io'

      const tempTronWeb = new TronWeb(
        new HttpProvider(fullNode),
        new HttpProvider(solidityNode),
        new HttpProvider(eventServer)
      )
      
      // Генерируем аккаунт (может быть синхронным или асинхронным)
      let account: any
      const accountResult = tempTronWeb.createAccount()
      
      // Проверяем, является ли результат промисом
      if (accountResult instanceof Promise) {
        account = await accountResult
      } else {
        account = accountResult
      }
      
      // Логируем структуру account для отладки (временно)
      console.log('Account structure:', account)
      console.log('Account keys:', Object.keys(account))
      
      // Пробуем получить приватный ключ разными способами
      let privateKey: string | null = null
      
      // Способ 1: Прямое обращение
      if (account.privateKey && typeof account.privateKey === 'string' && account.privateKey.length > 0) {
        privateKey = account.privateKey
      }
      
      // Способ 2: Проверяем другие возможные поля
      if (!privateKey && (account as any).private_key) {
        privateKey = (account as any).private_key
      }
      
      // Способ 3: Проверяем метод getPrivateKey, если есть
      if (!privateKey && typeof (account as any).getPrivateKey === 'function') {
        privateKey = (account as any).getPrivateKey()
      }
      
      // Проверяем результат
      if (!privateKey || typeof privateKey !== 'string' || privateKey.length === 0) {
        console.error('Failed to extract private key from account:', account)
        throw new Error('Не удалось создать валидный приватный ключ. Структура аккаунта неожиданная.')
      }
      
      // Получаем адрес: пробуем разные способы
      let address: string | null = null
      
      // Способ 1: Из объекта account.address
      if (account.address) {
        if (typeof account.address === 'string') {
          address = account.address
        } else if (account.address.base58) {
          address = account.address.base58
        } else if (account.address.hex) {
          address = tempTronWeb.address.fromHex(account.address.hex)
        }
      }
      
      // Способ 2: Вычисляем из приватного ключа через экземпляр TronWeb
      if (!address) {
        tempTronWeb.setPrivateKey(account.privateKey)
        if (tempTronWeb.defaultAddress) {
          const addr = tempTronWeb.defaultAddress
          if (typeof addr === 'string') {
            address = addr
          } else if (addr.base58) {
            address = addr.base58
          }
        }
      }
      
      // Способ 3: Используем статический метод TronWeb (последняя попытка)
      if (!address) {
        try {
          const computedAddress = TronWeb.address.fromPrivateKey(account.privateKey)
          if (computedAddress && typeof computedAddress === 'string' && computedAddress.length > 0) {
            address = computedAddress
          }
        } catch (e) {
          // Игнорируем ошибку, пробуем дальше
        }
      }
      
      // Проверяем результат
      if (!address || typeof address !== 'string' || address.length === 0) {
        throw new Error('Не удалось получить адрес кошелька из созданного аккаунта')
      }
      
      return {
        address,
        privateKey,
      }
    } catch (error: any) {
      console.error('Error generating wallet:', error)
      throw new Error(error.message || 'Ошибка при создании кошелька')
    }
  }

  async importWallet(privateKey: string): Promise<boolean> {
    try {
      // Создаём экземпляр TronWeb, если его ещё нет
      if (!this.tronWeb) {
        const HttpProvider = TronWeb.providers.HttpProvider
        const fullNode = 'https://api.trongrid.io'
        const solidityNode = 'https://api.trongrid.io'
        const eventServer = 'https://api.trongrid.io'

        this.tronWeb = new TronWeb(
          new HttpProvider(fullNode),
          new HttpProvider(solidityNode),
          new HttpProvider(eventServer)
        )
      }

      // Устанавливаем приватный ключ
      this.tronWeb.setPrivateKey(privateKey)
      
      // Проверяем, что адрес установлен
      const address = await this.getAddress()
      if (!address) {
        throw new Error('Не удалось получить адрес из приватного ключа')
      }
      
      // Сохраняем приватный ключ в sessionStorage для восстановления после перезагрузки
      // sessionStorage удаляется при закрытии браузера - более безопасно
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tron_wallet_private_key', privateKey)
        console.log('💾 Приватный ключ сохранён в sessionStorage для восстановления после перезагрузки')
      }
      
      this.isConnected = true
      return true
    } catch (error: any) {
      console.error('Error importing wallet:', error)
      throw new Error(error.message || 'Ошибка при импорте кошелька')
    }
  }

  disconnect(): void {
    this.tronWeb = null
    this.isConnected = false
    // Удаляем сохранённый приватный ключ
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tron_wallet_private_key')
    }
  }

  getTronWeb(): TronWeb | null {
    return this.tronWeb
  }

  getIsConnected(): boolean {
    return this.isConnected
  }
}

export const tronWebService = new TronWebService()

