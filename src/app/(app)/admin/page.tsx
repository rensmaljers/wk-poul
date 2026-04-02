import { createClient } from '@/lib/supabase/server'
import { config } from '@/lib/config'
import type { Prediction } from '@/lib/types/database'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: profiles } = await supabase.from('profiles').select('id') as { data: { id: string }[] | null }
  const { data: predictions } = await supabase.from('predictions').select('id') as { data: { id: string }[] | null }
  const { data: matches } = await supabase.from('matches').select('id, competition') as { data: { id: number; competition: string }[] | null }
  const { data: bonus } = await supabase.from('bonus_predictions').select('id') as { data: { id: number }[] | null }

  const matchesByComp: Record<string, number> = {}
  for (const m of matches ?? []) {
    matchesByComp[m.competition] = (matchesByComp[m.competition] ?? 0) + 1
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Gebruikers', value: (profiles ?? []).length, icon: '👥' },
          { label: 'Voorspellingen', value: (predictions ?? []).length, icon: '🎯' },
          { label: 'Wedstrijden', value: (matches ?? []).length, icon: '⚽' },
          { label: 'Bonus antwoorden', value: (bonus ?? []).length, icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Competitions overview */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Competities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {Object.values(config.competitions).map(comp => (
          <div key={comp.code} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{comp.icon}</span>
              <span className="font-semibold text-gray-900">{comp.label}</span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Wedstrijden: <span className="font-medium text-gray-700">{matchesByComp[comp.code] ?? 0}</span></p>
              <p>API code: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{comp.apiCode}</span></p>
              <p>Kleur: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{comp.navColor}</span></p>
              <p>Groepen: {comp.hasGroups ? '✅' : '❌'} &middot; Bonus: {comp.hasBonus ? '✅' : '❌'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Config overview */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Configuratie</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">App naam</p>
            <p className="font-medium text-gray-900">{config.appName}</p>
          </div>
          <div>
            <p className="text-gray-500">Bedrijf</p>
            <p className="font-medium text-gray-900">{config.companyName}</p>
          </div>
          <div>
            <p className="text-gray-500">Puntensysteem</p>
            <p className="font-medium text-gray-900">Exact: {config.scoring.exact} · Verschil: {config.scoring.difference} · Winnaar: {config.scoring.winner}</p>
          </div>
          <div>
            <p className="text-gray-500">Admins</p>
            <div className="space-y-0.5">
              {config.adminEmails.map(email => (
                <p key={email} className="font-mono text-xs text-gray-700">{email}</p>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Configuratie aanpassen: bewerk <code className="bg-gray-100 px-1 py-0.5 rounded">src/lib/config.ts</code> en deploy opnieuw.
        </p>
      </div>

      {/* New white-label guide */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Nieuwe white-label aanmaken</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Fork of clone de <a href="https://github.com/rensmaljers/wk-poul" className="text-orange-600 hover:underline" target="_blank">GitHub repository</a></li>
          <li>Pas <code className="bg-gray-100 px-1 py-0.5 rounded">src/lib/config.ts</code> aan met je eigen branding, competities en admins</li>
          <li>Maak een nieuw <a href="https://supabase.com" className="text-orange-600 hover:underline" target="_blank">Supabase</a> project aan en voer <code className="bg-gray-100 px-1 py-0.5 rounded">supabase-schema.sql</code> uit</li>
          <li>Maak een gratis API key aan op <a href="https://www.football-data.org" className="text-orange-600 hover:underline" target="_blank">football-data.org</a></li>
          <li>Deploy naar <a href="https://vercel.com" className="text-orange-600 hover:underline" target="_blank">Vercel</a> en stel de environment variables in</li>
          <li>Sync wedstrijden via <code className="bg-gray-100 px-1 py-0.5 rounded">/admin/sync</code></li>
        </ol>
      </div>
    </div>
  )
}
