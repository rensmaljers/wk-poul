'use client'

import { createClient } from '@/lib/supabase/client'
import type { Match, Prediction } from '@/lib/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function pointsLabel(points: number | null) {
  if (points === null) return null
  if (points === 5) return { text: 'Exact! +5', color: 'bg-green-100 text-green-700' }
  if (points === 3) return { text: 'Verschil +3', color: 'bg-blue-100 text-blue-700' }
  if (points === 2) return { text: 'Winnaar +2', color: 'bg-orange-100 text-orange-700' }
  return { text: '0 punten', color: 'bg-gray-100 text-gray-500' }
}

export default function PredictionForm({
  match,
  prediction,
  locked,
}: {
  match: Match
  prediction: Prediction | null
  locked: boolean
}) {
  const [homeScore, setHomeScore] = useState(prediction?.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(prediction?.away_score?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    if (homeScore === '' || awayScore === '') return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      match_id: match.id,
      home_score: parseInt(homeScore),
      away_score: parseInt(awayScore),
    }

    if (prediction) {
      await supabase
        .from('predictions')
        .update({ home_score: payload.home_score, away_score: payload.away_score, updated_at: new Date().toISOString() })
        .eq('id', prediction.id)
    } else {
      await supabase.from('predictions').insert(payload)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const pl = pointsLabel(prediction?.points ?? null)

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${
      locked ? 'border-gray-100' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{formatDate(match.match_date)}</span>
        <div className="flex items-center gap-2">
          {match.status === 'FINISHED' && match.home_score !== null && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              Uitslag: {match.home_score} - {match.away_score}
            </span>
          )}
          {pl && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pl.color}`}>
              {pl.text}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {match.home_flag && <span className="mr-1.5">{match.home_flag}</span>}
            {match.home_team}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={locked}
            className="w-12 h-10 text-center text-lg font-bold border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            placeholder="-"
          />
          <span className="text-gray-400 font-bold">-</span>
          <input
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={locked}
            className="w-12 h-10 text-center text-lg font-bold border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            placeholder="-"
          />
        </div>

        <div className="flex-1">
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {match.away_flag && <span className="mr-1.5">{match.away_flag}</span>}
            {match.away_team}
          </span>
        </div>
      </div>

      {!locked && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving || homeScore === '' || awayScore === ''}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40'
            }`}
          >
            {saving ? 'Opslaan...' : saved ? 'Opgeslagen!' : prediction ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      )}
    </div>
  )
}
