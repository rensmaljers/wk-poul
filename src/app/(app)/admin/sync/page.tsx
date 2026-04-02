import { config } from '@/lib/config'
import SyncControls from '@/components/AdminSyncControls'

export default function AdminSyncPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sync & Data</h1>
      <p className="text-gray-500 mb-6">Beheer wedstrijddata en testgegevens.</p>
      <SyncControls competitions={Object.values(config.competitions).map(c => ({ code: c.code, label: c.label, icon: c.icon }))} />
    </div>
  )
}
