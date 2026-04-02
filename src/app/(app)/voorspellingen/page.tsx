import { createClient } from '@/lib/supabase/server'
import PredictionForm from '@/components/PredictionForm'
import type { Match, Prediction } from '@/lib/types/database'

export default async function VoorspellingenPage() {
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

  // Split into upcoming and past
  const now = new Date()
  const upcoming = (matches ?? []).filter(m => new Date(m.match_date) > now)
  const past = (matches ?? []).filter(m => new Date(m.match_date) <= now)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Voorspellingen</h1>
      <p className="text-gray-500 mb-6">
        Vul je voorspellingen in voor de aankomende wedstrijden. Je kunt je voorspelling wijzigen tot de wedstrijd begint.
      </p>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-lg text-gray-600 mb-2">Nog geen wedstrijden beschikbaar</p>
          <p className="text-sm text-gray-400">
            Zodra het speelschema geladen is kun je je voorspellingen invullen.
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Aankomende wedstrijden
              </h2>
              <div className="space-y-3">
                {upcoming.map((match) => (
                  <PredictionForm
                    key={match.id}
                    match={match}
                    prediction={predictionMap.get(match.id) ?? null}
                    locked={false}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-gray-400 rounded-full"></span>
                Gespeelde wedstrijden
              </h2>
              <div className="space-y-3">
                {past.map((match) => (
                  <PredictionForm
                    key={match.id}
                    match={match}
                    prediction={predictionMap.get(match.id) ?? null}
                    locked={true}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
