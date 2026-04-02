'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUserActions({
  userId,
  displayName,
  isTest,
}: {
  userId: string
  displayName: string
  isTest: boolean
}) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je "${displayName}" en al hun data wilt verwijderen?`)) return
    setDeleting(true)

    // Delete predictions and bonus first, then profile
    await supabase.from('bonus_predictions').delete().eq('user_id', userId)
    await supabase.from('predictions').delete().eq('user_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)

    setDeleting(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {deleting ? '...' : 'Verwijder'}
    </button>
  )
}
