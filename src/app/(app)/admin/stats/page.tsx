import { createClient } from '@/lib/supabase/server'
import type { Prediction, Match } from '@/lib/types/database'

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, created_at') as { data: { id: string; display_name: string; avatar_url: string | null; created_at: string }[] | null }

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*') as { data: Prediction[] | null }

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true }) as { data: Match[] | null }

  const { data: bonusPredictions } = await supabase
    .from('bonus_predictions')
    .select('user_id, question_key') as { data: { user_id: string; question_key: string }[] | null }

  const allProfiles = profiles ?? []
  const allPredictions = predictions ?? []
  const allMatches = matches ?? []
  const allBonus = bonusPredictions ?? []

  // --- Per user stats ---
  const userStats = allProfiles.map(p => {
    const preds = allPredictions.filter(pr => pr.user_id === p.id)
    const bonus = allBonus.filter(b => b.user_id === p.id)
    const draws = preds.filter(pr => pr.home_score === pr.away_score)
    const homeWins = preds.filter(pr => pr.home_score > pr.away_score)
    const awayWins = preds.filter(pr => pr.home_score < pr.away_score)
    const avgHome = preds.length ? (preds.reduce((s, pr) => s + pr.home_score, 0) / preds.length).toFixed(1) : '-'
    const avgAway = preds.length ? (preds.reduce((s, pr) => s + pr.away_score, 0) / preds.length).toFixed(1) : '-'

    return {
      ...p,
      totalPredictions: preds.length,
      bonusFilled: bonus.length,
      draws: draws.length,
      homeWins: homeWins.length,
      awayWins: awayWins.length,
      avgHome,
      avgAway,
    }
  }).sort((a, b) => b.totalPredictions - a.totalPredictions)

  // --- Global stats ---
  const totalUsers = allProfiles.length
  const totalPredictions = allPredictions.length
  const totalBonusFilled = allBonus.length
  const avgPredictionsPerUser = totalUsers ? (totalPredictions / totalUsers).toFixed(0) : 0

  // Most popular scores
  const scoreCounts: Record<string, number> = {}
  allPredictions.forEach(p => {
    const key = `${p.home_score}-${p.away_score}`
    scoreCounts[key] = (scoreCounts[key] ?? 0) + 1
  })
  const topScores = Object.entries(scoreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Most predicted draws
  const totalDraws = allPredictions.filter(p => p.home_score === p.away_score).length
  const drawPercentage = totalPredictions ? ((totalDraws / totalPredictions) * 100).toFixed(1) : 0

  // Most popular match (most predictions)
  const matchPredCounts: Record<number, number> = {}
  allPredictions.forEach(p => {
    matchPredCounts[p.match_id] = (matchPredCounts[p.match_id] ?? 0) + 1
  })
  const topMatchIds = Object.entries(matchPredCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const matchMap = new Map(allMatches.map(m => [m.id, m]))

  // Highest predicted score totals
  const highestTotal = allPredictions.reduce((max, p) => {
    const total = p.home_score + p.away_score
    return total > max.total ? { total, pred: p } : max
  }, { total: 0, pred: null as Prediction | null })

  // Users who haven't filled in anything
  const lazyUsers = allProfiles.filter(p =>
    !allPredictions.some(pr => pr.user_id === p.id) && !allBonus.some(b => b.user_id === p.id)
  )

  // Optimists vs pessimists (avg goals predicted)
  const optimists = userStats
    .filter(u => u.totalPredictions > 0)
    .sort((a, b) => (parseFloat(b.avgHome) + parseFloat(b.avgAway)) - (parseFloat(a.avgHome) + parseFloat(a.avgAway)))

  // --- Fun Awards ---
  const activeUsers = userStats.filter(u => u.totalPredictions >= 5)

  // "De Eenling" - most unique predictor (least overlap with others)
  const uniqueScores = activeUsers.map(u => {
    const userPreds = allPredictions.filter(p => p.user_id === u.id)
    let uniqueCount = 0
    for (const pred of userPreds) {
      const othersWithSame = allPredictions.filter(p =>
        p.match_id === pred.match_id && p.user_id !== u.id &&
        p.home_score === pred.home_score && p.away_score === pred.away_score
      ).length
      if (othersWithSame === 0) uniqueCount++
    }
    return { ...u, uniqueCount, uniquePct: userPreds.length ? ((uniqueCount / userPreds.length) * 100).toFixed(0) : '0' }
  }).sort((a, b) => b.uniqueCount - a.uniqueCount)

  // "1-0 Liefhebber" - most used single score
  const userFavScores = activeUsers.map(u => {
    const userPreds = allPredictions.filter(p => p.user_id === u.id)
    const counts: Record<string, number> = {}
    userPreds.forEach(p => {
      const key = `${p.home_score}-${p.away_score}`
      counts[key] = (counts[key] ?? 0) + 1
    })
    const [favScore, favCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? ['-', 0]
    return { ...u, favScore, favCount: favCount as number, favPct: userPreds.length ? ((favCount as number / userPreds.length) * 100).toFixed(0) : '0' }
  }).sort((a, b) => b.favCount - a.favCount)

  // "Oranje fan" - highest avg goals given to Netherlands
  const nlMatches = allMatches.filter(m => m.home_team === 'Netherlands' || m.away_team === 'Netherlands')
  const nlFans = activeUsers.map(u => {
    const nlPreds = allPredictions.filter(p =>
      p.user_id === u.id && nlMatches.some(m => m.id === p.match_id)
    )
    let totalNlGoals = 0
    for (const pred of nlPreds) {
      const match = nlMatches.find(m => m.id === pred.match_id)
      if (!match) continue
      totalNlGoals += match.home_team === 'Netherlands' ? pred.home_score : pred.away_score
    }
    return { ...u, nlGoals: totalNlGoals, nlMatches: nlPreds.length, nlAvg: nlPreds.length ? (totalNlGoals / nlPreds.length).toFixed(1) : '0' }
  }).sort((a, b) => parseFloat(b.nlAvg) - parseFloat(a.nlAvg))

  // "Clean sheet koning" - most 0s predicted
  const cleanSheetKings = activeUsers.map(u => {
    const userPreds = allPredictions.filter(p => p.user_id === u.id)
    const cleanSheets = userPreds.filter(p => p.home_score === 0 || p.away_score === 0).length
    return { ...u, cleanSheets, csPct: userPreds.length ? ((cleanSheets / userPreds.length) * 100).toFixed(0) : '0' }
  }).sort((a, b) => b.cleanSheets - a.cleanSheets)

  // "De Mainstream" - most predictions that match the majority
  const mainstreamers = activeUsers.map(u => {
    const userPreds = allPredictions.filter(p => p.user_id === u.id)
    let mainstreamCount = 0
    for (const pred of userPreds) {
      const matchPreds = allPredictions.filter(p => p.match_id === pred.match_id)
      const counts: Record<string, number> = {}
      matchPreds.forEach(p => {
        const key = `${p.home_score}-${p.away_score}`
        counts[key] = (counts[key] ?? 0) + 1
      })
      const mostPopular = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (mostPopular && `${pred.home_score}-${pred.away_score}` === mostPopular[0]) {
        mainstreamCount++
      }
    }
    return { ...u, mainstreamCount, msPct: userPreds.length ? ((mainstreamCount / userPreds.length) * 100).toFixed(0) : '0' }
  }).sort((a, b) => b.mainstreamCount - a.mainstreamCount)

  // Biggest upset believer - most away wins predicted
  const upsetBelievers = activeUsers.map(u => {
    const pct = u.totalPredictions ? ((u.awayWins / u.totalPredictions) * 100).toFixed(0) : '0'
    return { ...u, awayPct: pct }
  }).sort((a, b) => b.awayWins - a.awayWins)

  // Fun awards compilation
  const awards = [
    { icon: '🦄', title: 'De Eenling', desc: 'Meest unieke voorspellingen', winner: uniqueScores[0], detail: `${uniqueScores[0]?.uniqueCount} unieke voorspellingen (${uniqueScores[0]?.uniquePct}%)` },
    { icon: '🔁', title: 'Favoriete Score', desc: 'Meest gebruikte uitslag', winner: userFavScores[0], detail: `${userFavScores[0]?.favScore} — ${userFavScores[0]?.favCount}x (${userFavScores[0]?.favPct}%)` },
    { icon: '🧡', title: 'Oranje Fan', desc: 'Meeste goals voor Nederland', winner: nlFans[0], detail: `gem. ${nlFans[0]?.nlAvg} goals voor NL` },
    { icon: '🧤', title: 'Clean Sheet Koning', desc: 'Meeste nulletjes voorspeld', winner: cleanSheetKings[0], detail: `${cleanSheetKings[0]?.cleanSheets} clean sheets (${cleanSheetKings[0]?.csPct}%)` },
    { icon: '🐑', title: 'De Mainstream', desc: 'Vaakst hetzelfde als de meerderheid', winner: mainstreamers[0], detail: `${mainstreamers[0]?.mainstreamCount}x populairste keuze (${mainstreamers[0]?.msPct}%)` },
    { icon: '🔮', title: 'Upset Believer', desc: 'Gelooft het meest in de underdog', winner: upsetBelievers[0], detail: `${upsetBelievers[0]?.awayWins} uitzeges (${upsetBelievers[0]?.awayPct}%)` },
    { icon: '🎰', title: 'Doelpuntenfestijn', desc: 'Hoogste totaal voorspeld', winner: highestTotal.pred ? allProfiles.find(p => p.id === highestTotal.pred!.user_id) : null, detail: highestTotal.pred ? `${highestTotal.pred.home_score}-${highestTotal.pred.away_score} (${highestTotal.total} goals)` : '-' },
    { icon: '😴', title: 'De Saaie', desc: 'Minst gevarieerde voorspellingen', winner: userFavScores[userFavScores.length - 1] ? { ...userFavScores.sort((a, b) => parseInt(b.favPct) - parseInt(a.favPct))[0] } : null, detail: userFavScores.length ? `${userFavScores.sort((a, b) => parseInt(b.favPct) - parseInt(a.favPct))[0]?.favScore} in ${userFavScores.sort((a, b) => parseInt(b.favPct) - parseInt(a.favPct))[0]?.favPct}% van de wedstrijden` : '-' },
  ].filter(a => a.winner)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Stats & Feitjes</h1>
      <p className="text-gray-500 mb-6">Alleen zichtbaar voor admins.</p>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Deelnemers', value: totalUsers, icon: '👥' },
          { label: 'Voorspellingen', value: totalPredictions, icon: '🎯' },
          { label: 'Gem. per persoon', value: avgPredictionsPerUser, icon: '📊' },
          { label: 'Bonusvragen ingevuld', value: totalBonusFilled, icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Fun Awards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Awards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {awards.map(award => (
          <div key={award.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-3xl mb-2">{award.icon}</div>
            <h3 className="font-bold text-gray-900 text-sm">{award.title}</h3>
            <p className="text-xs text-gray-400 mb-2">{award.desc}</p>
            <p className="text-sm font-semibold text-orange-600">
              {String((award.winner as Record<string, string>)?.avatar_url ?? '')}{' '}
              {String((award.winner as Record<string, string>)?.display_name ?? '')}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{award.detail}</p>
          </div>
        ))}
      </div>

      {/* Fun facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Most popular scores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Populairste voorspellingen</h3>
          <div className="space-y-2">
            {topScores.map(([score, count], i) => (
              <div key={score} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                <span className="font-bold text-gray-900">{score}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(count / topScores[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">{count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Draw lovers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Gelijkspel-fans</h3>
          <p className="text-sm text-gray-500 mb-3">
            {drawPercentage}% van alle voorspellingen is een gelijkspel
          </p>
          <div className="space-y-2">
            {userStats
              .filter(u => u.totalPredictions > 0)
              .sort((a, b) => (b.draws / b.totalPredictions) - (a.draws / a.totalPredictions))
              .slice(0, 5)
              .map(u => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">
                    {u.avatar_url && <span className="mr-1">{u.avatar_url}</span>}
                    {u.display_name}
                  </span>
                  <span className="text-gray-500">{u.draws} draws ({((u.draws / u.totalPredictions) * 100).toFixed(0)}%)</span>
                </div>
              ))}
          </div>
        </div>

        {/* Optimists - most goals predicted */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Optimisten (meeste goals voorspeld)</h3>
          <div className="space-y-2">
            {optimists.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">
                  {u.avatar_url && <span className="mr-1">{u.avatar_url}</span>}
                  {u.display_name}
                </span>
                <span className="text-gray-500">gem. {u.avgHome}-{u.avgAway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pessimists - least goals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Pessimisten (minste goals voorspeld)</h3>
          <div className="space-y-2">
            {optimists.slice(-5).reverse().map(u => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">
                  {u.avatar_url && <span className="mr-1">{u.avatar_url}</span>}
                  {u.display_name}
                </span>
                <span className="text-gray-500">gem. {u.avgHome}-{u.avgAway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most popular matches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Populairste wedstrijden</h3>
          <div className="space-y-2">
            {topMatchIds.map(([matchId, count]) => {
              const m = matchMap.get(Number(matchId))
              if (!m) return null
              return (
                <div key={matchId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">
                    {m.home_flag} {m.home_team} vs {m.away_team} {m.away_flag}
                  </span>
                  <span className="text-gray-500">{count} voorspellingen</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Wildest prediction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Gekste voorspelling</h3>
          {highestTotal.pred ? (() => {
            const m = matchMap.get(highestTotal.pred!.match_id)
            const u = allProfiles.find(p => p.id === highestTotal.pred!.user_id)
            return (
              <div>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {highestTotal.pred!.home_score} - {highestTotal.pred!.away_score}
                </p>
                <p className="text-sm text-gray-600">
                  {m ? `${m.home_flag} ${m.home_team} vs ${m.away_team} ${m.away_flag}` : 'Onbekende wedstrijd'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Door: {u?.display_name ?? 'Onbekend'}
                </p>
              </div>
            )
          })() : <p className="text-gray-400">Nog geen voorspellingen</p>}
        </div>
      </div>

      {/* Per user overview */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Per deelnemer</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">Naam</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Voorsp.</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Bonus</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Thuis</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Gelijk</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Uit</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Gem.</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Aangemeld</th>
            </tr>
          </thead>
          <tbody>
            {userStats.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 px-4 font-medium text-gray-900">
                  {u.avatar_url && <span className="mr-1">{u.avatar_url}</span>}
                  {u.display_name}
                </td>
                <td className="text-center py-2 px-3 text-gray-600">{u.totalPredictions}</td>
                <td className="text-center py-2 px-3 text-gray-600">{u.bonusFilled}</td>
                <td className="text-center py-2 px-3 text-gray-600 hidden sm:table-cell">{u.homeWins}</td>
                <td className="text-center py-2 px-3 text-gray-600 hidden sm:table-cell">{u.draws}</td>
                <td className="text-center py-2 px-3 text-gray-600 hidden sm:table-cell">{u.awayWins}</td>
                <td className="text-center py-2 px-3 text-gray-600 hidden sm:table-cell">{u.avgHome}-{u.avgAway}</td>
                <td className="text-center py-2 px-3 text-gray-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lazy users */}
      {lazyUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-semibold text-red-800 mb-2">Nog niks ingevuld ({lazyUsers.length})</h3>
          <p className="text-sm text-red-600">
            {lazyUsers.map(u => u.display_name).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
