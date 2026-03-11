import { useState } from 'react'
import { useAccountLookup } from '../../hooks/useAccountLookup'

function formatAlgo(microAlgos: number): string {
  const algo = microAlgos / 1_000_000
  return algo.toLocaleString(undefined, { minimumFractionDigits: 6 })
}

export function AccountLookup() {
  const [input, setInput] = useState('')
  const { account, loading, error, lookup } = useAccountLookup()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim().length > 0) lookup(input)
  }

  return (
    <div className="bg-base-200 rounded-box shadow p-4">
      <h3 className="text-sm font-semibold mb-3 opacity-60">Account Lookup</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          className="input input-bordered input-sm flex-1 font-mono text-xs"
          placeholder="Address or NFD name (e.g. urtho.algo)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-sm btn-primary" disabled={input.trim().length === 0 || loading}>
          {loading ? <span className="loading loading-spinner loading-xs" /> : 'Lookup'}
        </button>
      </form>

      {error && <div className="alert alert-error text-sm mb-2">{error}</div>}

      {account && (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <tbody>
              {account.nfd && (
                <tr>
                  <td className="opacity-60">NFD</td>
                  <td className="font-semibold">{account.nfd}</td>
                </tr>
              )}
              <tr>
                <td className="opacity-60">Address</td>
                <td className="font-mono text-xs break-all">{account.address}</td>
              </tr>
              <tr>
                <td className="opacity-60">Balance</td>
                <td className="font-mono">{formatAlgo(account.balance)} ALGO</td>
              </tr>
              <tr>
                <td className="opacity-60">Min Balance</td>
                <td className="font-mono">{formatAlgo(account.minBalance)} ALGO</td>
              </tr>
              <tr>
                <td className="opacity-60">Status</td>
                <td>
                  <span className={`badge badge-sm ${account.status === 'Online' ? 'badge-success' : 'badge-ghost'}`}>
                    {account.status}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="opacity-60">Incentive Eligible</td>
                <td>{account.incentiveEligible ? '✓' : '—'}</td>
              </tr>
              <tr>
                <td className="opacity-60">Apps Opted In</td>
                <td>{account.totalAppsOptedIn}</td>
              </tr>
              <tr>
                <td className="opacity-60">Assets Opted In</td>
                <td>{account.totalAssetsOptedIn}</td>
              </tr>
              <tr>
                <td className="opacity-60">Created Apps</td>
                <td>{account.totalCreatedApps}</td>
              </tr>
              <tr>
                <td className="opacity-60">Created Assets</td>
                <td>{account.totalCreatedAssets}</td>
              </tr>
              {account.lastProposed > 0 && (
                <tr>
                  <td className="opacity-60">Last Proposed</td>
                  <td>Round {account.lastProposed.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
