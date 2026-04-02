import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role or admin client for API routes
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Country code to flag emoji mapping
const FLAG_MAP: Record<string, string> = {
  'Netherlands': '🇳🇱', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Spain': '🇪🇸',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Portugal': '🇵🇹',
  'Belgium': '🇧🇪', 'Italy': '🇮🇹', 'Croatia': '🇭🇷', 'Morocco': '🇲🇦',
  'Japan': '🇯🇵', 'USA': '🇺🇸', 'United States': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦',
  'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Senegal': '🇸🇳', 'Denmark': '🇩🇰',
  'Switzerland': '🇨🇭', 'Australia': '🇦🇺', 'Poland': '🇵🇱', 'South Korea': '🇰🇷',
  'Ecuador': '🇪🇨', 'Saudi Arabia': '🇸🇦', 'Ghana': '🇬🇭', 'Cameroon': '🇨🇲',
  'Serbia': '🇷🇸', 'Costa Rica': '🇨🇷', 'Tunisia': '🇹🇳', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Iran': '🇮🇷', 'Qatar': '🇶🇦', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬',
  'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Paraguay': '🇵🇾', 'Bolivia': '🇧🇴',
  'Venezuela': '🇻🇪', 'Honduras': '🇭🇳', 'Jamaica': '🇯🇲', 'Panama': '🇵🇦',
  'Trinidad and Tobago': '🇹🇹', 'China PR': '🇨🇳', 'Indonesia': '🇮🇩',
  'Bahrain': '🇧🇭', 'New Zealand': '🇳🇿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Austria': '🇦🇹', 'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿',
  'Türkiye': '🇹🇷', 'Turkey': '🇹🇷',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Ukraine': '🇺🇦', 'Romania': '🇷🇴',
  'Hungary': '🇭🇺', 'Ireland': '🇮🇪', 'Slovenia': '🇸🇮', 'Slovakia': '🇸🇰',
  'Albania': '🇦🇱', 'Georgia': '🇬🇪', 'Iceland': '🇮🇸', 'Finland': '🇫🇮',
  'Greece': '🇬🇷', 'Israel': '🇮🇱', 'Algeria': '🇩🇿', 'Ivory Coast': '🇨🇮',
  "Côte d'Ivoire": '🇨🇮', 'Mali': '🇲🇱', 'Burkina Faso': '🇧🇫',
  'DR Congo': '🇨🇩', 'Congo DR': '🇨🇩',
  'South Africa': '🇿🇦', 'Tanzania': '🇹🇿', 'Uganda': '🇺🇬', 'Mozambique': '🇲🇿',
  'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼', 'Angola': '🇦🇴', 'Benin': '🇧🇯',
  'Bosnia-Herzegovina': '🇧🇦', 'Bosnia and Herzegovina': '🇧🇦',
  'Cape Verde Islands': '🇨🇻', 'Cape Verde': '🇨🇻',
  'Curaçao': '🇨🇼', 'Curacao': '🇨🇼',
  'Haiti': '🇭🇹', 'Iraq': '🇮🇶', 'Jordan': '🇯🇴',
  'Uzbekistan': '🇺🇿', 'Oman': '🇴🇲', 'Kuwait': '🇰🇼',
  'Kenya': '🇰🇪', 'Ethiopia': '🇪🇹', 'Libya': '🇱🇾',
  'North Macedonia': '🇲🇰', 'Montenegro': '🇲🇪',
  'Luxembourg': '🇱🇺', 'Lithuania': '🇱🇹', 'Latvia': '🇱🇻',
  'Palestine': '🇵🇸', 'Syria': '🇸🇾', 'Lebanon': '🇱🇧',
  'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪',
  'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭',
  'Malaysia': '🇲🇾', 'Singapore': '🇸🇬',
}

function getFlag(teamName: string): string {
  return FLAG_MAP[teamName] ?? '🏳️'
}

// Translate stage names to Dutch
function translateStage(stage: string): string {
  const map: Record<string, string> = {
    'GROUP_STAGE': 'Groepsfase',
    'ROUND_OF_32': '32e finale',
    'LAST_32': '32e finale',
    'ROUND_OF_16': 'Achtste finale',
    'LAST_16': 'Achtste finale',
    'QUARTER_FINALS': 'Kwartfinale',
    'SEMI_FINALS': 'Halve finale',
    'THIRD_PLACE': 'Troostfinale',
    'FINAL': 'Finale',
  }
  return map[stage] ?? stage
}

// Supported competitions
const COMPETITIONS: Record<string, { code: string; name: string; translateStages: boolean }> = {
  WC: { code: 'WC', name: 'WK 2026', translateStages: true },
  DED: { code: 'DED', name: 'Eredivisie', translateStages: false },
}

// Translate Eredivisie matchday to stage name
function formatMatchday(matchday: number | null): string {
  if (!matchday) return 'Eredivisie'
  return `Speelronde ${matchday}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.SYNC_SECRET && process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not configured' }, { status: 500 })
  }

  // Which competition to sync (default: all)
  const comp = searchParams.get('competition') ?? 'all'
  const compsToSync = comp === 'all'
    ? Object.keys(COMPETITIONS)
    : [comp.toUpperCase()]

  const results: Record<string, { total: number; upserted: number }> = {}

  const supabase = createAdminClient()

  for (const compKey of compsToSync) {
    const competition = COMPETITIONS[compKey]
    if (!competition) continue

    try {
      const response = await fetch(`https://api.football-data.org/v4/competitions/${competition.code}/matches`, {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 0 },
      })

      if (!response.ok) {
        const text = await response.text()
        results[compKey] = { total: 0, upserted: 0 }
        console.error(`Failed to sync ${compKey}:`, text)
        continue
      }

      const data = await response.json()
      const matches = data.matches ?? []

      let upserted = 0
      for (const match of matches) {
        const homeTeam = match.homeTeam?.name ?? 'TBD'
        const awayTeam = match.awayTeam?.name ?? 'TBD'

        const stage = competition.translateStages
          ? translateStage(match.stage)
          : formatMatchday(match.matchday)

        const { error } = await supabase
          .from('matches')
          .upsert({
            external_id: match.id,
            competition: compKey,
            stage,
            group_name: match.group?.replace('GROUP_', '') ?? null,
            home_team: homeTeam,
            away_team: awayTeam,
            home_flag: getFlag(homeTeam),
            away_flag: getFlag(awayTeam),
            home_score: match.score?.fullTime?.home ?? null,
            away_score: match.score?.fullTime?.away ?? null,
            match_date: match.utcDate,
            status: match.status,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'external_id' })

        if (!error) upserted++
      }

      results[compKey] = { total: matches.length, upserted }
    } catch (error) {
      console.error(`Failed to sync ${compKey}:`, error)
      results[compKey] = { total: 0, upserted: 0 }
    }
  }

  return NextResponse.json({ success: true, results })
}
