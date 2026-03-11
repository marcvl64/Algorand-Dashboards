import { createContext, useMemo, type ReactNode } from 'react'
import algosdk from 'algosdk'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

export interface AlgoClients {
  algod: algosdk.Algodv2
  indexer: algosdk.Indexer
}

export const AlgoClientContext = createContext<AlgoClients | null>(null)

export function AlgoClientProvider({ children }: { children: ReactNode }) {
  const clients = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algod = new algosdk.Algodv2(String(algodConfig.token ?? ''), algodConfig.server, algodConfig.port ?? '')

    const idxConfig = getIndexerConfigFromViteEnvironment()
    const indexer = new algosdk.Indexer(String(idxConfig.token ?? ''), idxConfig.server, idxConfig.port ?? '')

    return { algod, indexer }
  }, [])

  return <AlgoClientContext.Provider value={clients}>{children}</AlgoClientContext.Provider>
}
