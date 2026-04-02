import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/config'
import Link from 'next/link'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/bonus', label: 'Bonus scoren', icon: '⭐' },
  { href: '/admin/users', label: 'Gebruikers', icon: '👥' },
  { href: '/admin/sync', label: 'Sync & Data', icon: '🔄' },
  { href: '/admin/stats', label: 'Stats', icon: '📊' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) redirect('/')

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {adminNav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-shrink-0 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  )
}
