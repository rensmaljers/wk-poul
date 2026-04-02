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
  'Japan': '🇯🇵', 'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦',
  'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Senegal': '🇸🇳', 'Denmark': '🇩🇰',
  'Switzerland': '🇨🇭', 'Australia': '🇦🇺', 'Poland': '🇵🇱', 'South Korea': '🇰🇷',
  'Ecuador': '🇪🇨', 'Saudi Arabia': '🇸🇦', 'Ghana': '🇬🇭', 'Cameroon': '🇨🇲',
  'Serbia': '🇷🇸', 'Costa Rica': '🇨🇷', 'Tunisia': '🇹🇳', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Iran': '🇮🇷', 'Qatar': '🇶🇦', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬',
  'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Paraguay': '🇵🇾', 'Bolivia': '🇧🇴',
  'Venezuela': '🇻🇪', 'Honduras': '🇭🇳', 'Jamaica': '🇯🇲', 'Panama': '🇵🇦',
  'Trinidad and Tobago': '🇹🇹', 'China PR': '🇨🇳', 'Indonesia': '🇮🇩',
  'Bahrain': '🇧🇭', 'New Zealand': '🇳🇿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Austria': '🇦🇹', 'Czech Republic': '🇨🇿', 'Türkiye': '🇹🇷', 'Turkey': '🇹🇷',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Ukraine': '🇺🇦', 'Romania': '🇷🇴',
  'Hungary': '🇭🇺', 'Ireland': '🇮🇪', 'Slovenia': '🇸🇮', 'Slovakia': '🇸🇰',
  'Albania': '🇦🇱', 'Georgia': '🇬🇪', 'Iceland': '🇮🇸', 'Finland': '🇫🇮',
  'Greece': '🇬🇷', 'Israel': '🇮🇱', 'Algeria': '🇩🇿', 'Ivory Coast': '🇨🇮',
  "Côte d'Ivoire": '🇨🇮', 'Mali': '🇲🇱', 'Burkina Faso': '🇧🇫', 'DR Congo': '🇨🇩',
  'South Africa': '🇿🇦', 'Tanzania': '🇹🇿', 'Uganda': '🇺🇬', 'Mozambique': '🇲🇿',
  'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼', 'Angola': '🇦🇴', 'Benin': '🇧🇯',
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

export async function GET(request: Request) {
  // Simple auth check via query param (use a secret key in production)
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.SYNC_SECRET && process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not configured' }, { status: 500 })
  }

  try {
    // FIFA World Cup 2026 competition code = WC
    const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': apiKey },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: 'Football API error', details: text }, { status: response.status })
    }

    const data = await response.json()
    const matches = data.matches ?? []

    const supabase = createAdminClient()

    let upserted = 0
    for (const match of matches) {
      const homeTeam = match.homeTeam?.name ?? 'TBD'
      const awayTeam = match.awayTeam?.name ?? 'TBD'

      const { error } = await supabase
        .from('matches')
        .upsert({
          external_id: match.id,
          stage: translateStage(match.stage),
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

    return NextResponse.json({
      success: true,
      total: matches.length,
      upserted,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync', details: String(error) }, { status: 500 })
  }
}
