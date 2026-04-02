'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { config } from '@/lib/config'

const COMP_THEMES: Record<string, { bg: string; text: string; hoverBg: string; logoutText: string }> = {
  orange: { bg: 'bg-orange-600', text: 'text-orange-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-orange-200' },
  blue: { bg: 'bg-blue-700', text: 'text-blue-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-blue-200' },
  green: { bg: 'bg-green-700', text: 'text-green-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-green-200' },
  red: { bg: 'bg-red-700', text: 'text-red-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-red-200' },
  purple: { bg: 'bg-purple-700', text: 'text-purple-100', hoverBg: 'hover:bg-white/10', logoutText: 'text-purple-200' },
}

const navItems = [
  { href: '/', label: 'Poule', icon: '🏆' },
  { href: '/wedstrijden', label: 'Wedstrijden', icon: '⚽' },
  { href: '/groepen', label: 'Stand', icon: '📊', requireGroups: true },
  { href: '/bonus', label: 'Bonus', icon: '⭐', requireBonus: true },
]

export default function Navigation({ userName }: { userName: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const comp = searchParams.get('comp') ?? config.defaultCompetition
  const compConfig = config.competitions[comp] ?? config.competitions[config.defaultCompetition]
  const theme = COMP_THEMES[compConfig.navColor] ?? COMP_THEMES.orange

  const visibleItems = navItems.filter(item => {
    if (item.requireGroups && !compConfig.hasGroups) return false
    if (item.requireBonus && !compConfig.hasBonus) return false
    return true
  })

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

  function compHref(href: string) {
    return comp === config.defaultCompetition ? href : `${href}?comp=${comp}`
  }

  const competitions = Object.values(config.competitions)

  return (
    <nav className={`${theme.bg} sticky top-0 z-50 shadow-md transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 min-w-0">
            {competitions.length > 1 ? (
              <div className="flex bg-black/10 rounded-lg p-0.5 gap-0.5">
                {competitions.map(c => (
                  <button
                    key={c.code}
                    onClick={() => switchComp(c.code)}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                      comp === c.code ? 'bg-white text-gray-800 shadow-sm' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{c.icon}</span>
                    <span className="hidden sm:inline">{c.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                {config.appName}
              </span>
            )}
            <span className="text-[10px] sm:text-xs bg-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap hidden md:inline">
              {config.companyName}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={compHref(item.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-white/20 text-white'
                    : `${theme.text} ${theme.hoverBg} hover:text-white`
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

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

        <div className="flex md:hidden gap-1 pb-2 -mx-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={compHref(item.href)}
              className={`flex-1 text-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-white/20 text-white'
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
