import type { Match } from '@/lib/types/database'

type TeamStats = {
  team: string
  flag: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

function calculateStandings(matches: Match[]): TeamStats[] {
  const stats: Record<string, TeamStats> = {}

  function getOrCreate(team: string, flag: string | null): TeamStats {
    if (!stats[team]) {
      stats[team] = { team, flag, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    }
    return stats[team]
  }

  for (const match of matches) {
    if (match.status !== 'FINISHED' || match.home_score === null || match.away_score === null) continue

    const home = getOrCreate(match.home_team, match.home_flag)
    const away = getOrCreate(match.away_team, match.away_flag)

    home.played++
    away.played++
    home.goalsFor += match.home_score
    home.goalsAgainst += match.away_score
    away.goalsFor += match.away_score
    away.goalsAgainst += match.home_score

    if (match.home_score > match.away_score) {
      home.won++
      home.points += 3
      away.lost++
    } else if (match.home_score < match.away_score) {
      away.won++
      away.points += 3
      home.lost++
    } else {
      home.drawn++
      away.drawn++
      home.points += 1
      away.points += 1
    }
  }

  // Also add teams that haven't played yet
  for (const match of matches) {
    getOrCreate(match.home_team, match.home_flag)
    getOrCreate(match.away_team, match.away_flag)
  }

  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })
}

export default function GroupStandings({ group, matches }: { group: string; matches: Match[] }) {
  const standings = calculateStandings(matches)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-orange-600 px-4 py-2">
        <h3 className="text-sm font-bold text-white">Groep {group}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Team</th>
            <th className="text-center py-2 px-1.5 text-xs font-semibold text-gray-500" title="Gespeeld">W</th>
            <th className="text-center py-2 px-1.5 text-xs font-semibold text-gray-500" title="Gewonnen">G</th>
            <th className="text-center py-2 px-1.5 text-xs font-semibold text-gray-500" title="Gelijk">GL</th>
            <th className="text-center py-2 px-1.5 text-xs font-semibold text-gray-500" title="Verloren">V</th>
            <th className="text-center py-2 px-1.5 text-xs font-semibold text-gray-500 hidden sm:table-cell" title="Doelpunten voor - tegen">DV</th>
            <th className="text-center py-2 px-2 text-xs font-bold text-gray-700" title="Punten">Pt</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, i) => (
            <tr key={team.team} className={`border-b border-gray-50 ${i < 2 ? 'bg-green-50/50' : ''}`}>
              <td className="py-2 px-3">
                <span className="font-medium text-gray-900">
                  {team.flag && <span className="mr-1.5">{team.flag}</span>}
                  {team.team}
                </span>
              </td>
              <td className="text-center py-2 px-1.5 text-gray-600">{team.played}</td>
              <td className="text-center py-2 px-1.5 text-gray-600">{team.won}</td>
              <td className="text-center py-2 px-1.5 text-gray-600">{team.drawn}</td>
              <td className="text-center py-2 px-1.5 text-gray-600">{team.lost}</td>
              <td className="text-center py-2 px-1.5 text-gray-600 hidden sm:table-cell">
                {team.goalsFor}-{team.goalsAgainst}
              </td>
              <td className="text-center py-2 px-2 font-bold text-gray-900">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
