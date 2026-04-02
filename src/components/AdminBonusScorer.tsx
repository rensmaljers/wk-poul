'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BonusPrediction } from '@/lib/types/database'

const QUESTION_LABELS: Record<string, { label: string; maxPoints: number }> = {
  world_champion: { label: 'Wie wordt wereldkampioen?', maxPoints: 15 },
  runner_up: { label: 'Wie wordt de verliezend finalist?', maxPoints: 10 },
  top_scorer: { label: 'Wie wordt topscorer van het toernooi?', maxPoints: 10 },
  netherlands_stage: { label: 'Hoe ver komt Nederland?', maxPoints: 10 },
  most_goals_team: { label: 'Welk land scoort de meeste doelpunten?', maxPoints: 10 },
  total_goals: { label: 'Hoeveel doelpunten in totaal?', maxPoints: 10 },
  first_red_card: { label: 'Welk land krijgt de eerste rode kaart?', maxPoints: 7 },
}

type BonusWithName = BonusPrediction & { display_name: string }

export default function AdminBonusScorer({
  grouped,
}: {
  grouped: Record<string, BonusWithName[]>
}) {
  const [saving, setSaving] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()

  async function scoreQuestion(questionKey: string, predictions: BonusWithName[]) {
    const answer = correctAnswer[questionKey]
    if (!answer?.trim()) return

    setSaving(questionKey)
    const maxPoints = QUESTION_LABELS[questionKey]?.maxPoints ?? 0
    const normalizedAnswer = answer.trim().toLowerCase()

    for (const pred of predictions) {
      const isCorrect = pred.answer.trim().toLowerCase() === normalizedAnswer
      await supabase
        .from('bonus_predictions')
        .update({ points: isCorrect ? maxPoints : 0 })
        .eq('id', pred.id)
    }

    setSaving(null)
    router.refresh()
  }

  async function setPoints(predictionId: number, points: number) {
    setSaving(String(predictionId))
    await supabase
      .from('bonus_predictions')
      .update({ points })
      .eq('id', predictionId)
    setSaving(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([questionKey, predictions]) => {
        const info = QUESTION_LABELS[questionKey] ?? { label: questionKey, maxPoints: 0 }

        // Count unique answers
        const answerCounts = predictions.reduce((acc: Record<string, number>, p) => {
          const a = p.answer.trim()
          acc[a] = (acc[a] ?? 0) + 1
          return acc
        }, {})

        return (
          <div key={questionKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-orange-600 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{info.label}</h3>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                max {info.maxPoints} pt
              </span>
            </div>

            {/* Quick score: type correct answer and auto-score all */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Juiste antwoord (auto-score)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={correctAnswer[questionKey] ?? ''}
                  onChange={(e) => setCorrectAnswer(prev => ({ ...prev, [questionKey]: e.target.value }))}
                  placeholder="Typ het juiste antwoord..."
                  className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => scoreQuestion(questionKey, predictions)}
                  disabled={saving === questionKey || !correctAnswer[questionKey]?.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40 whitespace-nowrap"
                >
                  {saving === questionKey ? '...' : 'Score alles'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Exacte match (hoofdletterongevoelig). Voor afwijkende antwoorden kun je hieronder per persoon scoren.
              </p>
            </div>

            {/* Answer summary */}
            <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
              <p className="text-xs text-gray-500">
                Antwoorden: {Object.entries(answerCounts).sort((a, b) => b[1] - a[1]).map(([a, c]) => `${a} (${c}x)`).join(', ')}
              </p>
            </div>

            {/* Individual predictions */}
            <div className="divide-y divide-gray-50">
              {predictions.map((pred) => (
                <div key={pred.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900">{pred.display_name}</span>
                    <span className="text-sm text-gray-500 ml-2">&mdash; {pred.answer}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setPoints(pred.id, 0)}
                      disabled={saving === String(pred.id)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        pred.points === 0 ? 'bg-red-100 text-red-700 ring-2 ring-red-300' : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                      }`}
                    >
                      0
                    </button>
                    <button
                      onClick={() => setPoints(pred.id, info.maxPoints)}
                      disabled={saving === String(pred.id)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        pred.points === info.maxPoints ? 'bg-green-100 text-green-700 ring-2 ring-green-300' : 'bg-gray-100 text-gray-500 hover:bg-green-50'
                      }`}
                    >
                      {info.maxPoints}
                    </button>
                    {pred.points !== null && (
                      <span className={`ml-1 text-xs font-semibold ${pred.points > 0 ? 'text-green-600' : 'text-red-400'}`}>
                        {pred.points > 0 ? `+${pred.points}` : '0'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
