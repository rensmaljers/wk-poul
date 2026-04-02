import { createClient } from '@/lib/supabase/server'
import type { Match } from '@/lib/types/database'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: string) {
  switch (status) {
    case 'FINISHED': return { text: 'Gespeeld', color: 'bg-green-100 text-green-700' }
    case 'LIVE': case 'IN_PLAY': return { text: 'LIVE', color: 'bg-red-100 text-red-700 animate-pulse' }
    case 'PAUSED': return { text: 'Rust', color: 'bg-yellow-100 text-yellow-700' }
    default: return { text: 'Gepland', color: 'bg-gray-100 text-gray-600' }
  }
}

export default async function WedstrijdenPage() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true }) as { data: Match[] | null }

  // Group by stage
  const grouped = (matches ?? []).reduce((acc: Record<string, Match[]>, match: Match) => {
    const key = match.group_name ? `Groep ${match.group_name}` : match.stage
    if (!acc[key]) acc[key] = []
    acc[key].push(match)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wedstrijden</h1>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-lg text-gray-600 mb-2">Wedstrijden worden geladen...</p>
          <p className="text-sm text-gray-400">
            Het speelschema wordt automatisch opgehaald zodra het beschikbaar is.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([stage, stageMatches]) => (
          <div key={stage} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
              {stage}
            </h2>
            <div className="space-y-2">
              {stageMatches.map((match) => {
                const status = statusLabel(match.status)
                return (
                  <div
                    key={match.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <span className="font-medium text-gray-900">
                          {match.home_flag && <span className="mr-2">{match.home_flag}</span>}
                          {match.home_team}
                        </span>
                      </div>

                      <div className="mx-4 flex items-center gap-2 min-w-[80px] justify-center">
                        {match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'IN_PLAY' ? (
                          <span className="text-xl font-bold text-gray-900">
                            {match.home_score} - {match.away_score}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">vs</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {match.away_flag && <span className="mr-2">{match.away_flag}</span>}
                          {match.away_team}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{formatDate(match.match_date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
