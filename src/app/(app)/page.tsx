import { createClient } from '@/lib/supabase/server'
import type { LeaderboardEntry } from '@/lib/types/database'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('grand_total', { ascending: false }) as { data: LeaderboardEntry[] | null }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stand</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Naam</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Exact</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Verschil</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Winnaar</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Bonus</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Punten</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-50 ${
                    index < 3 ? 'bg-orange-50/50' : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {entry.avatar_url && <span className="text-lg">{entry.avatar_url}</span>}
                      <span className="font-medium text-gray-900">{entry.display_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                    {entry.exact_scores}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                    {entry.correct_differences}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                    {entry.correct_winners}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                    {entry.bonus_points}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-lg text-orange-600">{entry.grand_total}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <p className="text-lg mb-2">Nog geen voorspellingen</p>
                  <p className="text-sm">Het toernooi is nog niet begonnen. Vul je voorspellingen in!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Puntentelling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-green-800">5 punten</p>
              <p className="text-sm text-green-600">Exacte score</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-blue-800">3 punten</p>
              <p className="text-sm text-blue-600">Juist doelpuntenverschil</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-orange-800">2 punten</p>
              <p className="text-sm text-orange-600">Juiste winnaar / gelijkspel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
