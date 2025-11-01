declare global {
  interface Window {
    global?: Window & typeof globalThis
    Buffer?: typeof Buffer
    process?: typeof process
    tronWeb?: {
      ready?: boolean
      defaultAddress?: {
        base58: string
      }
      isConnected: () => Promise<boolean>
      trx: {
        getBalance: (address: string) => Promise<number>
        sign: (transaction: any) => Promise<any>
        sendRawTransaction: (transaction: any) => Promise<{ txid: string }>
      }
      transactionBuilder: {
        sendTrx: (to: string, amount: number, from: string) => Promise<any>
      }
      setPrivateKey: (privateKey: string) => void
      createAccount: () => Promise<{
        address: {
          base58: string
        }
        privateKey: string
      }>
    }
    tronLink?: {
      request: (options: { method: string }) => Promise<void>
    }
  }
  
  const global: Window & typeof globalThis
}

export {}

