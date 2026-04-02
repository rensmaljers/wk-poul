'use client'

import { createClient } from '@/lib/supabase/client'
import type { Match, Prediction } from '@/lib/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function pointsBadge(points: number | null) {
  if (points === null) return null
  if (points === 5) return { text: '+5', color: 'bg-green-100 text-green-700' }
  if (points === 3) return { text: '+3', color: 'bg-blue-100 text-blue-700' }
  if (points === 2) return { text: '+2', color: 'bg-amber-100 text-amber-700' }
  return { text: '0', color: 'bg-gray-100 text-gray-400' }
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

  const pb = pointsBadge(prediction?.points ?? null)
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY'
  const isFinished = match.status === 'FINISHED'

  return (
    <div className={`px-3 py-2.5 sm:px-4 sm:py-3 ${isLive ? 'bg-red-50/50' : ''}`}>
      {/* Mobile layout */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400">{formatTime(match.match_date)}</span>
          <div className="flex items-center gap-1.5">
            {isLive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold animate-pulse">LIVE</span>}
            {isFinished && match.home_score !== null && (
              <span className="text-[10px] font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded">
                {match.home_score}-{match.away_score}
              </span>
            )}
            {pb && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pb.color}`}>{pb.text}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-right text-sm truncate">
            {match.home_flag && <span className="mr-1">{match.home_flag}</span>}
            <span className="font-medium text-gray-900">{match.home_team}</span>
          </div>
          <input
            type="number" min="0" max="20" value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={locked}
            className="w-9 h-8 text-center text-sm font-bold border border-gray-200 rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            placeholder="-"
          />
          <span className="text-gray-300 text-xs">-</span>
          <input
            type="number" min="0" max="20" value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={locked}
            className="w-9 h-8 text-center text-sm font-bold border border-gray-200 rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            placeholder="-"
          />
          <div className="flex-1 text-sm truncate">
            {match.away_flag && <span className="mr-1">{match.away_flag}</span>}
            <span className="font-medium text-gray-900">{match.away_team}</span>
          </div>
          {!locked && (
            <button
              onClick={handleSave}
              disabled={saving || homeScore === '' || awayScore === ''}
              className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 transition-all ${
                saved ? 'bg-green-100 text-green-700' : 'bg-orange-600 text-white disabled:opacity-30'
              }`}
            >
              {saving ? '...' : saved ? '✓' : '→'}
            </button>
          )}
        </div>
      </div>

      {/* Desktop layout - single row */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs text-gray-400 w-12 flex-shrink-0">{formatTime(match.match_date)}</span>

        <div className="flex-1 text-right truncate">
          {match.home_flag && <span className="mr-1.5">{match.home_flag}</span>}
          <span className="font-medium text-gray-900 text-sm">{match.home_team}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="number" min="0" max="20" value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={locked}
            className="w-10 h-8 text-center text-sm font-bold border border-gray-200 rounded-md focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            placeholder="-"
          />
          <span className="text-gray-300 text-xs">-</span>
          <input
            type="number" min="0" max="20" value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={locked}
            className="w-10 h-8 text-center text-sm font-bold border border-gray-200 rounded-md focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            placeholder="-"
          />
        </div>

        <div className="flex-1 truncate">
          {match.away_flag && <span className="mr-1.5">{match.away_flag}</span>}
          <span className="font-medium text-gray-900 text-sm">{match.away_team}</span>
        </div>

        {/* Result + points */}
        <div className="flex items-center gap-1.5 flex-shrink-0 w-24 justify-end">
          {isLive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold animate-pulse">LIVE</span>}
          {isFinished && match.home_score !== null && (
            <span className="text-[10px] font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded">
              {match.home_score}-{match.away_score}
            </span>
          )}
          {pb && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pb.color}`}>{pb.text}</span>}
        </div>

        {/* Save button */}
        <div className="w-16 flex-shrink-0 text-right">
          {!locked ? (
            <button
              onClick={handleSave}
              disabled={saving || homeScore === '' || awayScore === ''}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                saved ? 'bg-green-100 text-green-700' : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-30'
              }`}
            >
              {saving ? '...' : saved ? '✓' : prediction ? 'Wijzig' : 'Opslaan'}
            </button>
          ) : (
            <span className="text-[10px] text-gray-300">🔒</span>
          )}
        </div>
      </div>
    </div>
  )
}
