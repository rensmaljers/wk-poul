import { createClient } from '@/lib/supabase/server'
import PredictionForm from '@/components/PredictionForm'
import GroupStandings from '@/components/GroupStandings'
import type { Match, Prediction } from '@/lib/types/database'

export default async function WedstrijdenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
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

  // Get group names for standings
  const groupNames = [...new Set(allMatches.filter(m => m.group_name).map(m => m.group_name!))]
    .sort()

  // Group matches by date for date headers
  function formatDateHeader(dateStr: string) {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Vandaag'
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen'

    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Wedstrijden & Voorspellingen</h1>
      <p className="text-gray-500 mb-6">
        Vul je voorspellingen in voor de wedstrijden. Je kunt wijzigen tot de wedstrijd begint.
      </p>

      {allMatches.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-lg text-gray-600 mb-2">Nog geen wedstrijden beschikbaar</p>
          <p className="text-sm text-gray-400">
            Het speelschema wordt automatisch opgehaald zodra het beschikbaar is.
          </p>
        </div>
      ) : (
        <>
          {/* Group Standings */}
          {groupNames.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Groepsstanden
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupNames.map(group => (
                  <GroupStandings
                    key={group}
                    group={group}
                    matches={allMatches.filter(m => m.group_name === group)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matches grouped by stage */}
          {Object.entries(grouped).map(([stage, stageMatches]) => {
            // Group stage matches by date
            const byDate = stageMatches.reduce((acc: Record<string, Match[]>, match) => {
              const dateKey = new Date(match.match_date).toDateString()
              if (!acc[dateKey]) acc[dateKey] = []
              acc[dateKey].push(match)
              return acc
            }, {})

            return (
              <div key={stage} className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                  {stage}
                </h2>

                {Object.entries(byDate).map(([dateKey, dateMatches]) => (
                  <div key={dateKey} className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-sm font-medium text-gray-500 px-2">
                        {formatDateHeader(dateMatches[0].match_date)}
                      </span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="space-y-2">
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
            )
          })}
        </>
      )}
    </div>
  )
}
