'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AVATARS = [
  '⚽', '🏆', '🥅', '🎯', '🦁', '🐉', '🦅', '🐺',
  '🔥', '⭐', '💎', '🌍', '🎩', '👑', '🤖', '🧙',
  '🦈', '🐻', '🦊', '🐯', '🦉', '🐧', '🦋', '🌟',
]

export default function ProfileForm({
  currentName,
  currentAvatar,
}: {
  currentName: string
  currentAvatar: string
}) {
  const [name, setName] = useState(currentName)
  const [avatar, setAvatar] = useState(currentAvatar || '⚽')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ display_name: name.trim(), avatar_url: avatar })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naam
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Je naam"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Avatar
          </label>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all ${
                  avatar === emoji
                    ? 'bg-orange-100 ring-2 ring-orange-500 scale-110'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{name || 'Je naam'}</p>
            <p className="text-sm text-gray-500">Zo zien anderen je in de stand</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40'
          }`}
        >
          {saving ? 'Opslaan...' : saved ? 'Opgeslagen!' : 'Profiel opslaan'}
        </button>
      </div>
    </div>
  )
}
