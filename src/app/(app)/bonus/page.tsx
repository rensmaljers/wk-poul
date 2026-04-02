import { createClient } from '@/lib/supabase/server'
import BonusForm from '@/components/BonusForm'
import type { BonusPrediction } from '@/lib/types/database'

const WK_LANDEN = [
  'Algerije', 'Argentinië', 'Australië', 'België', 'Bosnië-Herzegovina',
  'Brazilië', 'Canada', 'Colombia', 'Congo DR', 'Curaçao', 'Duitsland',
  'Ecuador', 'Egypte', 'Engeland', 'Frankrijk', 'Ghana', 'Haïti',
  'Irak', 'Iran', 'Ivoorkust', 'Japan', 'Jordanië', 'Kaapverdië',
  'Kroatië', 'Marokko', 'Mexico', 'Nederland', 'Nieuw-Zeeland', 'Noorwegen',
  'Oezbekistan', 'Oostenrijk', 'Panama', 'Paraguay', 'Portugal', 'Qatar',
  'Saudi-Arabië', 'Schotland', 'Senegal', 'Spanje', 'Tsjechië',
  'Tunesië', 'Turkije', 'Uruguay', 'USA', 'Zuid-Afrika', 'Zuid-Korea',
  'Zweden', 'Zwitserland',
]

// Groepen met teams (Nederlandse namen)
const GROEPEN: Record<string, string[]> = {
  A: ['Mexico', 'Tsjechië', 'Zuid-Afrika', 'Zuid-Korea'],
  B: ['Canada', 'Zwitserland', 'Qatar', 'Bosnië-Herzegovina'],
  C: ['Brazilië', 'Marokko', 'Schotland', 'Haïti'],
  D: ['USA', 'Turkije', 'Australië', 'Paraguay'],
  E: ['Duitsland', 'Ecuador', 'Ivoorkust', 'Curaçao'],
  F: ['Nederland', 'Japan', 'Zweden', 'Tunesië'],
  G: ['België', 'Egypte', 'Iran', 'Nieuw-Zeeland'],
  H: ['Spanje', 'Uruguay', 'Saudi-Arabië', 'Kaapverdië'],
  I: ['Frankrijk', 'Noorwegen', 'Senegal', 'Irak'],
  J: ['Argentinië', 'Oostenrijk', 'Algerije', 'Jordanië'],
  K: ['Portugal', 'Colombia', 'Oezbekistan', 'Congo DR'],
  L: ['Engeland', 'Kroatië', 'Ghana', 'Panama'],
}

// ---- TOERNOOI VRAGEN ----
const TOURNAMENT_QUESTIONS = [
  {
    key: 'world_champion',
    question: 'Wie wordt wereldkampioen?',
    points: 15,
    type: 'select' as const,
    options: WK_LANDEN,
  },
  {
    key: 'runner_up',
    question: 'Wie wordt de verliezend finalist?',
    points: 10,
    type: 'select' as const,
    options: WK_LANDEN,
  },
  {
    key: 'top_scorer',
    question: 'Wie wordt topscorer van het toernooi?',
    points: 10,
    type: 'text' as const,
  },
  {
    key: 'netherlands_stage',
    question: 'Hoe ver komt Nederland?',
    points: 10,
    type: 'select' as const,
    options: ['Groepsfase', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Finale', 'Wereldkampioen'],
  },
  {
    key: 'most_goals_team',
    question: 'Welk land scoort de meeste doelpunten?',
    points: 10,
    type: 'select' as const,
    options: WK_LANDEN,
  },
  {
    key: 'total_goals',
    question: 'Hoeveel doelpunten worden er in totaal gescoord?',
    points: 10,
    type: 'number' as const,
  },
  {
    key: 'most_yellow_cards',
    question: 'Welk land krijgt de meeste gele kaarten?',
    points: 7,
    type: 'select' as const,
    options: WK_LANDEN,
  },
  {
    key: 'most_red_cards',
    question: 'Welk land krijgt de meeste rode kaarten?',
    points: 7,
    type: 'select' as const,
    options: WK_LANDEN,
  },
  {
    key: 'first_red_card',
    question: 'Welk land krijgt de eerste rode kaart?',
    points: 7,
    type: 'select' as const,
    options: WK_LANDEN,
  },
  {
    key: 'highest_scoring_match',
    question: 'Hoeveel goals vallen er in de wedstrijd met de meeste doelpunten?',
    points: 7,
    type: 'number' as const,
  },
  {
    key: 'best_goalkeeper',
    question: 'Wie wordt de beste keeper van het toernooi (Gouden Handschoen)?',
    points: 7,
    type: 'text' as const,
  },
  {
    key: 'best_young_player',
    question: 'Wie wordt de beste jonge speler van het toernooi?',
    points: 7,
    type: 'text' as const,
  },
]

// ---- GROEPSFASE VRAGEN ----
// Vul deze in vóór de eerste wedstrijd van het toernooi!
const GROUP_QUESTIONS = Object.entries(GROEPEN).flatMap(([group, teams]) => [
  {
    key: `group_${group}_winner`,
    question: `Groep ${group} — Wie wordt nummer 1?`,
    points: 3,
    type: 'select' as const,
    options: teams,
  },
  {
    key: `group_${group}_runnerup`,
    question: `Groep ${group} — Wie wordt nummer 2?`,
    points: 2,
    type: 'select' as const,
    options: teams,
  },
])

export { TOURNAMENT_QUESTIONS, GROUP_QUESTIONS }

export default async function BonusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bonusPredictions } = await supabase
    .from('bonus_predictions')
    .select('*')
    .eq('user_id', user!.id) as { data: BonusPrediction[] | null }

  const predictionMap = new Map(
    (bonusPredictions ?? []).map(p => [p.question_key, p])
  )

  const allQuestions = [...TOURNAMENT_QUESTIONS, ...GROUP_QUESTIONS]

  // Count how many are filled in
  const filledIn = allQuestions.filter(q => predictionMap.has(q.key)).length

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bonusvragen</h1>
      <p className="text-gray-500 mb-4">
        Vul je bonusvoorspellingen in voor extra punten. Je kunt je antwoorden wijzigen tot het toernooi begint.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-orange-800 font-medium">
          Ingevuld: {filledIn} / {allQuestions.length} vragen
        </p>
        <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${(filledIn / allQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Toernooi vragen */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
        Toernooi voorspellingen
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {TOURNAMENT_QUESTIONS.map((q) => (
          <BonusForm
            key={q.key}
            question={q}
            currentAnswer={predictionMap.get(q.key)?.answer ?? ''}
            points={predictionMap.get(q.key)?.points ?? null}
          />
        ))}
      </div>

      {/* Groepsfase vragen */}
      <h2 className="text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
        <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
        Groepsfase voorspellingen
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Voorspel de nummer 1 en 2 van elke groep. Vul dit in vóór de eerste wedstrijd!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(GROEPEN).map(([group, teams]) => {
          const winnerKey = `group_${group}_winner`
          const runnerKey = `group_${group}_runnerup`
          return (
            <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-orange-600 px-4 py-2">
                <h3 className="text-sm font-bold text-white">Groep {group}</h3>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-400">{teams.join(' · ')}</p>
                <BonusForm
                  question={{ key: winnerKey, question: 'Nummer 1', points: 3, type: 'select', options: teams }}
                  currentAnswer={predictionMap.get(winnerKey)?.answer ?? ''}
                  points={predictionMap.get(winnerKey)?.points ?? null}
                  compact
                />
                <BonusForm
                  question={{ key: runnerKey, question: 'Nummer 2', points: 2, type: 'select', options: teams }}
                  currentAnswer={predictionMap.get(runnerKey)?.answer ?? ''}
                  points={predictionMap.get(runnerKey)?.points ?? null}
                  compact
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
