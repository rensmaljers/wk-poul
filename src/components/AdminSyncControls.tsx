'use client'

import { useState } from 'react'

type Competition = { code: string; label: string; icon: string }

export default function AdminSyncControls({ competitions }: { competitions: Competition[] }) {
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  async function syncCompetition(code: string) {
    setLoading(code)
    setResults(prev => ({ ...prev, [code]: 'Syncing...' }))
    try {
      const res = await fetch(`/api/sync-matches?secret=${getSecret()}&competition=${code}`)
      const data = await res.json()
      if (data.success) {
        const r = data.results?.[code]
        setResults(prev => ({ ...prev, [code]: `${r?.upserted ?? 0} wedstrijden gesynct` }))
      } else {
        setResults(prev => ({ ...prev, [code]: `Fout: ${data.error}` }))
      }
    } catch (e) {
      setResults(prev => ({ ...prev, [code]: `Fout: ${e}` }))
    }
    setLoading(null)
  }

  async function syncAll() {
    setLoading('all')
    setResults({ all: 'Syncing alles...' })
    try {
      const res = await fetch(`/api/sync-matches?secret=${getSecret()}&competition=all`)
      const data = await res.json()
      if (data.success) {
        const summary = Object.entries(data.results as Record<string, { upserted: number }>)
          .map(([k, v]) => `${k}: ${v.upserted}`)
          .join(', ')
        setResults({ all: summary })
      } else {
        setResults({ all: `Fout: ${data.error}` })
      }
    } catch (e) {
      setResults({ all: `Fout: ${e}` })
    }
    setLoading(null)
  }

  async function seedData() {
    setLoading('seed')
    setResults(prev => ({ ...prev, seed: 'Seeding...' }))
    try {
      const res = await fetch(`/api/seed?secret=${getSecret()}`)
      const data = await res.json()
      setResults(prev => ({ ...prev, seed: data.success ? `${data.usersCreated} users, ${data.predictionsCreated} voorspellingen` : `Fout: ${data.error}` }))
    } catch (e) {
      setResults(prev => ({ ...prev, seed: `Fout: ${e}` }))
    }
    setLoading(null)
  }

  async function cleanupData() {
    if (!confirm('Weet je zeker dat je alle testdata wilt verwijderen?')) return
    setLoading('cleanup')
    setResults(prev => ({ ...prev, cleanup: 'Opruimen...' }))
    try {
      const res = await fetch(`/api/seed?secret=${getSecret()}&action=cleanup`)
      const data = await res.json()
      setResults(prev => ({ ...prev, cleanup: data.success ? `${data.removed} test-gebruikers verwijderd` : `Fout: ${data.error}` }))
    } catch (e) {
      setResults(prev => ({ ...prev, cleanup: `Fout: ${e}` }))
    }
    setLoading(null)
  }

  function getSecret() {
    // Read from a prompt or use env
    const saved = sessionStorage.getItem('sync_secret')
    if (saved) return saved
    const secret = prompt('Voer het SYNC_SECRET in:')
    if (secret) sessionStorage.setItem('sync_secret', secret)
    return secret ?? ''
  }

  return (
    <div className="space-y-6">
      {/* Sync competitions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Wedstrijden synchroniseren</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {competitions.map(comp => (
            <button
              key={comp.code}
              onClick={() => syncCompetition(comp.code)}
              disabled={loading !== null}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <span className="text-sm font-medium">
                <span className="mr-2">{comp.icon}</span>
                {comp.label} syncen
              </span>
              {loading === comp.code && <span className="text-xs text-gray-400 animate-pulse">...</span>}
            </button>
          ))}
        </div>
        <button
          onClick={syncAll}
          disabled={loading !== null}
          className="w-full p-3 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {loading === 'all' ? 'Bezig...' : '🔄 Alles syncen'}
        </button>
        {Object.entries(results).filter(([k]) => k !== 'seed' && k !== 'cleanup').map(([key, msg]) => (
          <p key={key} className="text-sm text-green-600 mt-2">{msg}</p>
        ))}
      </div>

      {/* Test data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Testdata</h3>
        <p className="text-sm text-gray-500 mb-4">
          Genereer 35 nep-gebruikers met willekeurige voorspellingen om de app te testen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={seedData}
            disabled={loading !== null}
            className="flex-1 p-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'seed' ? 'Bezig...' : '🌱 Testdata aanmaken'}
          </button>
          <button
            onClick={cleanupData}
            disabled={loading !== null}
            className="flex-1 p-3 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'cleanup' ? 'Bezig...' : '🗑️ Testdata verwijderen'}
          </button>
        </div>
        {results.seed && <p className="text-sm text-green-600 mt-2">{results.seed}</p>}
        {results.cleanup && <p className="text-sm text-red-600 mt-2">{results.cleanup}</p>}
      </div>
    </div>
  )
}
