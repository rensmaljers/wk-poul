import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { config } from '@/lib/config'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single() as { data: { display_name: string } | null }

  return (
    <>
      <Navigation userName={profile?.display_name ?? user.email ?? 'Gebruiker'} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="text-center py-4 text-sm text-gray-400 border-t border-gray-100">
        {config.companyName} &middot; {config.appName}
      </footer>
    </>
  )
}
