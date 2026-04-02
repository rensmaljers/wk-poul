import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminBonusScorer from '@/components/AdminBonusScorer'
import type { BonusPrediction } from '@/lib/types/database'

// Hardcoded admin emails - add your own
const ADMIN_EMAILS = [
  'rens@recranet.com',
  'rens@elloro.nl',
  'rensmaljers@gmail.com',
  'dazz@elloro.nl',
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/')
  }

  const { data: bonusPredictions } = await supabase
    .from('bonus_predictions')
    .select('*')
    .order('question_key') as { data: BonusPrediction[] | null }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name') as { data: { id: string; display_name: string }[] | null }

  const profileMap = new Map(
    (profiles ?? []).map(p => [p.id, p.display_name])
  )

  // Group by question
  const grouped = (bonusPredictions ?? []).reduce((acc: Record<string, (BonusPrediction & { display_name: string })[]>, bp) => {
    if (!acc[bp.question_key]) acc[bp.question_key] = []
    acc[bp.question_key].push({
      ...bp,
      display_name: profileMap.get(bp.user_id) ?? 'Onbekend',
    })
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin - Bonusvragen scoren</h1>
      <p className="text-gray-500 mb-6">
        Bekijk alle ingevulde bonusantwoorden en ken punten toe.
      </p>

      <AdminBonusScorer grouped={grouped} />
    </div>
  )
}
