// ============================================
// White-label configuratie
// Pas dit bestand aan om de app te herbranden
// ============================================

export const config = {
  // Branding
  appName: 'WK Poule 2026',
  companyName: 'Recranet X Elloro',
  tagline: 'Voorspel de uitslagen, verdien punten en claim de titel!',
  favicon: '⚽',

  // Admin emails (hebben toegang tot /admin)
  adminEmails: [
    'rens@recranet.com',
    'rens@elloro.nl',
    'rensmaljers@gmail.com',
    'dazz@elloro.nl',
    'wout@recranet.com',
  ],

  // Competities
  competitions: {
    WC: {
      code: 'WC',
      apiCode: 'WC',
      label: 'WK 2026',
      icon: '🏆',
      navColor: 'orange',
      hasGroups: true,
      hasBonus: true,
      firstMatchDate: '2026-06-11T19:00:00+00:00',
    },
    DED: {
      code: 'DED',
      apiCode: 'DED',
      label: 'Eredivisie',
      icon: '🇳🇱',
      navColor: 'blue',
      hasGroups: false,
      hasBonus: false,
      firstMatchDate: null,
    },
  } as Record<string, CompetitionConfig>,

  // Default competitie
  defaultCompetition: 'WC',

  // Puntensysteem
  scoring: {
    exact: 5,
    difference: 3,
    winner: 2,
  },

  // Groepsvoorspellingen punten
  groupScoring: {
    winner: 3,
    runnerUp: 2,
  },
}

export type CompetitionConfig = {
  code: string
  apiCode: string
  label: string
  icon: string
  navColor: string
  hasGroups: boolean
  hasBonus: boolean
  firstMatchDate: string | null
}

export function getCompetition(code: string): CompetitionConfig {
  return config.competitions[code] ?? config.competitions[config.defaultCompetition]
}

export function isAdmin(email: string | null | undefined): boolean {
  return config.adminEmails.includes(email ?? '')
}
