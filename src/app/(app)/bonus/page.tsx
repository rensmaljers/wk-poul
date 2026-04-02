import { createClient } from '@/lib/supabase/server'
import BonusForm from '@/components/BonusForm'
import type { BonusPrediction } from '@/lib/types/database'

const WK_LANDEN = [
  'Argentinië', 'Australië', 'België', 'Bolivia', 'Brazilië', 'Canada',
  'Chili', 'Colombia', 'Costa Rica', 'Denemarken', 'Duitsland', 'Ecuador',
  'Egypte', 'Engeland', 'Frankrijk', 'Honduras', 'Hongarije', 'Indonesië',
  'Iran', 'Italië', 'Ivoorkust', 'Jamaica', 'Japan', 'Kameroen',
  'Kroatië', 'Marokko', 'Mexico', 'Nederland', 'Nigeria', 'Noord-Macedonië',
  'Oekraïne', 'Oezbekistan', 'Panama', 'Paraguay', 'Peru', 'Polen',
  'Portugal', 'Qatar', 'Saudi-Arabië', 'Schotland', 'Senegal', 'Servië',
  'Slovenië', 'Spanje', 'Trinidad en Tobago', 'Turkije', 'Uruguay',
  'USA', 'Venezuela', 'Wales', 'Zuid-Korea', 'Zwitserland',
]

const BONUS_QUESTIONS = [
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
    key: 'first_red_card',
    question: 'Welk land krijgt de eerste rode kaart?',
    points: 7,
    type: 'select' as const,
    options: WK_LANDEN,
  },
]

export { BONUS_QUESTIONS }

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bonusvragen</h1>
      <p className="text-gray-500 mb-6">
        Vul je bonusvoorspellingen in voor extra punten. Je kunt je antwoorden wijzigen tot het toernooi begint.
      </p>

      <div className="space-y-4">
        {BONUS_QUESTIONS.map((q) => (
          <BonusForm
            key={q.key}
            question={q}
            currentAnswer={predictionMap.get(q.key)?.answer ?? ''}
            points={predictionMap.get(q.key)?.points ?? null}
          />
        ))}
      </div>
    </div>
  )
}
