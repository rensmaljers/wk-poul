import { createClient } from '@/lib/supabase/server'
import type { LeaderboardEntry } from '@/lib/types/database'
import Tooltip from '@/components/Tooltip'
import Countdown from '@/components/Countdown'

// First match: June 11 2026, 19:00 UTC
const FIRST_MATCH_DATE = '2026-06-11T19:00:00+00:00'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('grand_total', { ascending: false }) as { data: LeaderboardEntry[] | null }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">WK Poule 2026</h1>
        <p className="text-gray-500">
          Welkom bij de WK Poule van Recranet X Elloro! Voorspel de uitslagen, verdien punten en claim de titel.
        </p>
      </div>

      <Countdown targetDate={FIRST_MATCH_DATE} />

      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Puntentelling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-amber-800">2 punten</p>
              <p className="text-sm text-amber-600">Juiste winnaar / gelijkspel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Naam</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-green-600 uppercase tracking-wider hidden sm:table-cell">
                <Tooltip text="Exacte score voorspeld — 5 punten per keer">Exact</Tooltip>
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-blue-600 uppercase tracking-wider hidden sm:table-cell">
                <Tooltip text="Juist doelpuntenverschil voorspeld — 3 punten per keer">Verschil</Tooltip>
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-amber-600 uppercase tracking-wider hidden sm:table-cell">
                <Tooltip text="Juiste winnaar of gelijkspel — 2 punten per keer">Winnaar</Tooltip>
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-purple-600 uppercase tracking-wider hidden sm:table-cell">
                <Tooltip text="Punten verdiend met bonusvragen">Bonus</Tooltip>
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                <Tooltip text="Totaal aantal punten (wedstrijden + bonus)">Punten</Tooltip>
              </th>
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
                  <td className="py-3 px-4 text-center text-sm font-medium text-green-700 hidden sm:table-cell">
                    {entry.exact_scores}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-medium text-blue-700 hidden sm:table-cell">
                    {entry.correct_differences}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-medium text-amber-700 hidden sm:table-cell">
                    {entry.correct_winners}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-medium text-purple-700 hidden sm:table-cell">
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

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Hoe werkt het?</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Voorspel de uitslag van alle WK-wedstrijden en verdien punten op basis van je voorspelling.
            Hoe dichter bij de echte uitslag, hoe meer punten.
          </p>
          <div>
            <p className="font-medium text-gray-800 mb-1">Wedstrijdpunten</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><span className="text-green-700 font-medium">5 punten</span> — Exacte score (bijv. je voorspelt 2-1 en het wordt 2-1)</li>
              <li><span className="text-blue-700 font-medium">3 punten</span> — Juist doelpuntenverschil (bijv. je voorspelt 3-1 en het wordt 2-0)</li>
              <li><span className="text-amber-700 font-medium">2 punten</span> — Juiste winnaar of gelijkspel</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">Bonuspunten</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><span className="text-purple-700 font-medium">Toernooi vragen</span> — Voorspel de wereldkampioen, topscorer, kaarten en meer (tot 15 pt per vraag)</li>
              <li><span className="text-purple-700 font-medium">Groepsfase</span> — Voorspel de nummer 1 en 2 van elke groep (3 pt voor #1, 2 pt voor #2)</li>
            </ul>
          </div>
          <p className="text-gray-400 text-xs">
            Voorspellingen vergrendelen bij de start van elke wedstrijd. Bonusvragen moeten vóór de eerste wedstrijd ingevuld zijn.
            Punten worden automatisch berekend, behalve bonusvragen die handmatig door de admin worden gescoord.
          </p>
        </div>
      </div>
    </div>
  )
}
