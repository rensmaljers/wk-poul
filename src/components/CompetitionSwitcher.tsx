'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const COMPETITIONS = [
  { key: 'WC', label: 'WK 2026', icon: '🏆' },
  { key: 'DED', label: 'Eredivisie', icon: '🇳🇱' },
]

export default function CompetitionSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function switchCompetition(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('comp', key)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5">
      {COMPETITIONS.map(comp => (
        <button
          key={comp.key}
          onClick={() => switchCompetition(comp.key)}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            current === comp.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="mr-1.5">{comp.icon}</span>
          {comp.label}
        </button>
      ))}
    </div>
  )
}
