import { createClient } from '@/lib/supabase/server'
import PredictionForm from '@/components/PredictionForm'
import type { Match, Prediction } from '@/lib/types/database'

export default async function WedstrijdenPage({
  searchParams,
}: {
  searchParams: Promise<{ comp?: string }>
}) {
  const { comp = 'WC' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('competition', comp)
    .order('match_date', { ascending: true }) as { data: Match[] | null }

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user!.id) as { data: Prediction[] | null }

  const predictionMap = new Map(
    (predictions ?? []).map(p => [p.match_id, p])
  )

  const allMatches = matches ?? []
  const now = new Date()

  // Group matches by stage/group
  const grouped = allMatches.reduce((acc: Record<string, Match[]>, match: Match) => {
    const key = match.group_name ? `Groep ${match.group_name}` : match.stage
    if (!acc[key]) acc[key] = []
    acc[key].push(match)
    return acc
  }, {})

  function formatDateHeader(dateStr: string) {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Vandaag'
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen'

    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const totalMatches = allMatches.length
  const filledIn = allMatches.filter(m => predictionMap.has(m.id)).length

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Wedstrijden</h1>
          <p className="text-gray-500 text-sm">Vul je voorspellingen in. Vergrendeld bij aanvang.</p>
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
          {filledIn}/{totalMatches}
        </span>
      </div>

      {allMatches.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-lg text-gray-600">Nog geen wedstrijden beschikbaar</p>
          <p className="text-sm text-gray-400 mt-1">
            {comp === 'DED' ? 'Sync de Eredivisie via /api/sync-matches?competition=DED' : 'Het speelschema wordt automatisch opgehaald.'}
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([stage, stageMatches]) => {
          const byDate = stageMatches.reduce((acc: Record<string, Match[]>, match) => {
            const dateKey = new Date(match.match_date).toDateString()
            if (!acc[dateKey]) acc[dateKey] = []
            acc[dateKey].push(match)
            return acc
          }, {})

          return (
            <div key={stage} className="mb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                {stage}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {Object.entries(byDate).map(([dateKey, dateMatches]) => (
                  <div key={dateKey}>
                    <div className="text-xs font-medium text-gray-400 mb-1.5 text-center">
                      {formatDateHeader(dateMatches[0].match_date)}
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                      {dateMatches.map((match) => {
                        const locked = new Date(match.match_date) <= now
                        return (
                          <PredictionForm
                            key={match.id}
                            match={match}
                            prediction={predictionMap.get(match.id) ?? null}
                            locked={locked}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
