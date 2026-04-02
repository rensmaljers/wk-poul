'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Poule', icon: '🏆' },
  { href: '/wedstrijden', label: 'Wedstrijden', icon: '⚽' },
  { href: '/groepen', label: 'Stand', icon: '📊' },
  { href: '/bonus', label: 'Bonus', icon: '⭐' },
]

export default function Navigation({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-orange-600 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">WK Poule</span>
            <span className="text-[10px] sm:text-xs bg-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap hidden sm:inline">
              Recranet X Elloro
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'text-orange-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/profiel"
              className={`text-sm font-medium transition-colors truncate max-w-[100px] sm:max-w-none ${
                pathname === '/profiel' ? 'text-white' : 'text-orange-100 hover:text-white'
              }`}
            >
              {userName}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm text-orange-200 hover:text-white transition-colors whitespace-nowrap"
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Mobile nav tabs */}
        <div className="flex md:hidden gap-1 pb-2 -mx-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-white/20 text-white'
                  : 'text-orange-100 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
