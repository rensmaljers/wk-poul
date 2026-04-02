import { createClient } from '@/lib/supabase/server'
import { config, isAdmin } from '@/lib/config'
import AdminUserActions from '@/components/AdminUserActions'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false }) as { data: { id: string; display_name: string; avatar_url: string | null; created_at: string }[] | null }

  // Get prediction counts per user
  const { data: predictions } = await supabase
    .from('predictions')
    .select('user_id') as { data: { user_id: string }[] | null }

  const predCounts: Record<string, number> = {}
  for (const p of predictions ?? []) {
    predCounts[p.user_id] = (predCounts[p.user_id] ?? 0) + 1
  }

  // Get bonus counts per user
  const { data: bonus } = await supabase
    .from('bonus_predictions')
    .select('user_id') as { data: { user_id: string }[] | null }

  const bonusCounts: Record<string, number> = {}
  for (const b of bonus ?? []) {
    bonusCounts[b.user_id] = (bonusCounts[b.user_id] ?? 0) + 1
  }

  // Get emails via auth admin
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
  const emailMap = new Map(
    (authUsers ?? []).map(u => [u.id, u.email ?? ''])
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Gebruikers</h1>
      <p className="text-gray-500 mb-6">{(profiles ?? []).length} geregistreerde gebruikers</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">Gebruiker</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 hidden sm:table-cell">Email</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Voorsp.</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Bonus</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Aangemeld</th>
              <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Rol</th>
              <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500">Acties</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map(p => {
              const email = emailMap.get(p.id) ?? ''
              const admin = isAdmin(email)
              const isTest = email.endsWith('@test.wkpoule.nl')
              return (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${isTest ? 'opacity-50' : ''}`}>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      {p.avatar_url && <span>{p.avatar_url}</span>}
                      <span className="font-medium text-gray-900">{p.display_name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-gray-500 hidden sm:table-cell">
                    <span className="font-mono text-xs">{email}</span>
                  </td>
                  <td className="text-center py-2 px-3 text-gray-600">{predCounts[p.id] ?? 0}</td>
                  <td className="text-center py-2 px-3 text-gray-600">{bonusCounts[p.id] ?? 0}</td>
                  <td className="text-center py-2 px-3 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(p.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="text-center py-2 px-3">
                    {admin ? (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Admin</span>
                    ) : isTest ? (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">Test</span>
                    ) : (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">User</span>
                    )}
                  </td>
                  <td className="text-right py-2 px-4">
                    <AdminUserActions userId={p.id} displayName={p.display_name} isTest={isTest} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
