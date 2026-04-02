import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfielPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single() as { data: { display_name: string; avatar_url: string | null } | null }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mijn profiel</h1>
      <ProfileForm
        currentName={profile?.display_name ?? ''}
        currentAvatar={profile?.avatar_url ?? ''}
      />
    </div>
  )
}
