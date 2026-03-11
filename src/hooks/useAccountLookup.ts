import { useState, useCallback } from 'react'
import { useAlgoClients } from '../clients/useAlgoClients'

export interface AccountInfo {
  address: string
  nfd: string
  balance: number
  status: string
  totalAppsOptedIn: number
  totalAssetsOptedIn: number
  totalCreatedApps: number
  totalCreatedAssets: number
  minBalance: number
  incentiveEligible: boolean
  lastProposed: number
  lastHeartbeat: number
}

async function resolveNfd(name: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.nf.domains/nfd/${encodeURIComponent(name)}?view=brief`)
    if (!resp.ok) return null
    const data = await resp.json()
    return data.depositAccount ?? data.owner ?? null
  } catch {
    return null
  }
}

async function reverseNfd(address: string): Promise<string> {
  try {
    const resp = await fetch(`https://api.nf.domains/nfd/lookup?address=${encodeURIComponent(address)}&view=brief&limit=1`)
    if (!resp.ok) return ''
    const data = await resp.json()
    // Response is an object keyed by address
    const entries = data[address]
    if (Array.isArray(entries) && entries.length > 0) return entries[0].name ?? ''
    return ''
  } catch {
    return ''
  }
}

export function useAccountLookup() {
  const { indexer } = useAlgoClients()
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = useCallback(
    async (input: string) => {
      setLoading(true)
      setError(null)
      setAccount(null)
      try {
        let address = input.trim()
        let nfd = ''

        // If input looks like an NFD name (contains . or doesn't look like an address)
        if (address.includes('.') || address.length !== 58) {
          const name = address.endsWith('.algo') ? address : `${address}.algo`
          const resolved = await resolveNfd(name)
          if (!resolved) {
            setError(`Could not resolve NFD: ${name}`)
            setLoading(false)
            return
          }
          nfd = name
          address = resolved
        } else {
          // Try reverse lookup for display
          nfd = await reverseNfd(address)
        }

        const result = await indexer.lookupAccountByID(address).do()
        const a = result.account
        setAccount({
          address: a.address,
          nfd,
          balance: Number(a.amount),
          status: a.status,
          totalAppsOptedIn: a.totalAppsOptedIn ?? 0,
          totalAssetsOptedIn: a.totalAssetsOptedIn ?? 0,
          totalCreatedApps: a.totalCreatedApps ?? 0,
          totalCreatedAssets: a.totalCreatedAssets ?? 0,
          minBalance: Number(a.minBalance ?? 0),
          incentiveEligible: a.incentiveEligible ?? false,
          lastProposed: Number(a.lastProposed ?? 0),
          lastHeartbeat: Number(a.lastHeartbeat ?? 0),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to look up account')
      } finally {
        setLoading(false)
      }
    },
    [indexer],
  )

  return { account, loading, error, lookup }
}
