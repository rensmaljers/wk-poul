import { createClient } from '@/lib/supabase/server'
import GroupStandings from '@/components/GroupStandings'
import type { Match } from '@/lib/types/database'

export default async function GroepenPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true }) as { data: Match[] | null }

  const allMatches = matches ?? []
  const groupNames = [...new Set(allMatches.filter(m => m.group_name).map(m => m.group_name!))].sort()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Groepsstanden</h1>
      <p className="text-gray-500 mb-6">
        Overzicht van alle poulegroepen. Groen = door naar de volgende ronde.
      </p>

      {groupNames.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg text-gray-600">Nog geen groepsstanden beschikbaar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupNames.map(group => (
            <GroupStandings
              key={group}
              group={group}
              matches={allMatches.filter(m => m.group_name === group)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
