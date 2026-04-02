'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BonusQuestion = {
  key: string
  question: string
  points: number
  type: 'text' | 'number' | 'select'
  options?: string[]
}

export default function BonusForm({
  question,
  currentAnswer,
  points,
  compact = false,
}: {
  question: BonusQuestion
  currentAnswer: string
  points: number | null
  compact?: boolean
}) {
  const [answer, setAnswer] = useState(currentAnswer)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    if (!answer.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('bonus_predictions')
      .upsert({
        user_id: user.id,
        question_key: question.key,
        answer: answer.trim(),
      }, { onConflict: 'user_id,question_key' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  // Compact mode for group predictions (inline within group card)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
          <span className="text-xs font-medium text-gray-600">{question.question}</span>
          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
            {question.points}pt
          </span>
        </div>
        <select
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value)
          }}
          className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-orange-500 focus:outline-none"
        >
          <option value="">Kies...</option>
          {question.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving || !answer.trim()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40'
          }`}
        >
          {saving ? '...' : saved ? '✓' : '→'}
        </button>
        {points !== null && (
          <span className={`text-xs font-semibold flex-shrink-0 ${points > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {points > 0 ? `+${points}` : '0'}
          </span>
        )}
      </div>
    )
  }

  // Full mode for tournament questions
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{question.question}</h3>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">
          {question.points} pt
        </span>
      </div>

      <div className="space-y-3">
        {question.type === 'select' ? (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 text-base focus:border-orange-500 focus:outline-none transition-colors"
          >
            <option value="">Kies...</option>
            {question.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={question.type}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Jouw antwoord..."
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 text-base focus:border-orange-500 focus:outline-none transition-colors"
          />
        )}

        <button
          onClick={handleSave}
          disabled={saving || !answer.trim()}
          className={`w-full sm:w-auto px-6 py-3 sm:py-2 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40'
          }`}
        >
          {saving ? 'Opslaan...' : saved ? 'Opgeslagen!' : 'Opslaan'}
        </button>
      </div>

      {points !== null && (
        <p className={`text-sm mt-3 font-medium ${points > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          {points > 0 ? `+${points} punten verdiend!` : 'Helaas, geen punten'}
        </p>
      )}
    </div>
  )
}
