import { useState, useCallback } from 'react'
import { useAlgoClients } from '../clients/useAlgoClients'

export interface AssetInfo {
  index: number
  name: string
  unitName: string
  total: string
  decimals: number
  creator: string
  url: string
  manager: string
  reserve: string
  freeze: string
  clawback: string
  defaultFrozen: boolean
}

export interface AssetSearchResult {
  id: number
  name: string
  unitName: string
}

export function useAssetLookup() {
  const { indexer } = useAlgoClients()
  const [asset, setAsset] = useState<AssetInfo | null>(null)
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookupById = useCallback(
    async (assetId: number) => {
      setLoading(true)
      setError(null)
      setAsset(null)
      setSearchResults([])
      try {
        const result = await indexer.lookupAssetByID(assetId).do()
        const a = result.asset
        const p = a.params
        setAsset({
          index: Number(a.index),
          name: p.name ?? '',
          unitName: p.unitName ?? '',
          total: String(p.total),
          decimals: p.decimals,
          creator: String(p.creator ?? ''),
          url: p.url ?? '',
          manager: String(p.manager ?? ''),
          reserve: String(p.reserve ?? ''),
          freeze: String(p.freeze ?? ''),
          clawback: String(p.clawback ?? ''),
          defaultFrozen: p.defaultFrozen ?? false,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to look up asset')
      } finally {
        setLoading(false)
      }
    },
    [indexer],
  )

  const searchByName = useCallback(
    async (name: string) => {
      setLoading(true)
      setError(null)
      setAsset(null)
      setSearchResults([])
      try {
        const result = await indexer.searchForAssets().name(name).limit(10).do()
        const results: AssetSearchResult[] = (result.assets ?? [])
          .filter((a: { deleted?: boolean }) => !a.deleted)
          .map((a: { index: bigint; params: { name?: string; unitName?: string } }) => ({
            id: Number(a.index),
            name: a.params.name ?? '',
            unitName: a.params.unitName ?? '',
          }))

        if (results.length === 1) {
          // Single match — load it directly
          await lookupById(results[0].id)
        } else if (results.length > 1) {
          setSearchResults(results)
        } else {
          setError(`No assets found matching "${name}"`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to search assets')
      } finally {
        setLoading(false)
      }
    },
    [indexer, lookupById],
  )

  const lookup = useCallback(
    async (input: string) => {
      const trimmed = input.trim()
      const asNum = Number(trimmed)
      if (!isNaN(asNum) && asNum > 0 && String(asNum) === trimmed) {
        await lookupById(asNum)
      } else {
        await searchByName(trimmed)
      }
    },
    [lookupById, searchByName],
  )

  return { asset, searchResults, loading, error, lookup, lookupById }
}
