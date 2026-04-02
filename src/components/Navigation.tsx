'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const COMP_THEMES = {
  WC: { bg: 'bg-orange-600', activeBg: 'bg-white/20', text: 'text-orange-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-orange-200' },
  DED: { bg: 'bg-blue-700', activeBg: 'bg-white/20', text: 'text-blue-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-blue-200' },
}

const navItems = [
  { href: '/', label: 'Poule', icon: '🏆' },
  { href: '/wedstrijden', label: 'Wedstrijden', icon: '⚽' },
  { href: '/groepen', label: 'Stand', icon: '📊', wcOnly: true },
  { href: '/bonus', label: 'Bonus', icon: '⭐', wcOnly: true },
]

export default function Navigation({ userName }: { userName: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const comp = searchParams.get('comp') ?? 'WC'
  const theme = COMP_THEMES[comp as keyof typeof COMP_THEMES] ?? COMP_THEMES.WC

  const visibleItems = navItems.filter(item => !item.wcOnly || comp === 'WC')

  function switchComp(newComp: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('comp', newComp)
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Build href with comp param preserved
  function compHref(href: string) {
    return comp === 'WC' ? href : `${href}?comp=${comp}`
  }

  return (
    <nav className={`${theme.bg} sticky top-0 z-50 shadow-md transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 min-w-0">
            {/* Competition switcher in nav */}
            <div className="flex bg-black/10 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => switchComp('WC')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  comp === 'WC' ? 'bg-white text-orange-600 shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                🏆 WK
              </button>
              <button
                onClick={() => switchComp('DED')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  comp === 'DED' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                🇳🇱 Eredivisie
              </button>
            </div>
            <span className="text-[10px] sm:text-xs bg-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap hidden md:inline">
              Recranet X Elloro
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={compHref(item.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? `${theme.activeBg} text-white`
                    : `${theme.text} ${theme.hoverBg} hover:text-white`
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
                pathname === '/profiel' ? 'text-white' : `${theme.text} hover:text-white`
              }`}
            >
              {userName}
            </Link>
            <button
              onClick={handleLogout}
              className={`text-xs sm:text-sm ${theme.logoutText} hover:text-white transition-colors whitespace-nowrap`}
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Mobile nav tabs */}
        <div className="flex md:hidden gap-1 pb-2 -mx-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={compHref(item.href)}
              className={`flex-1 text-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? `${theme.activeBg} text-white`
                  : `${theme.text} ${theme.hoverBg}`
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
