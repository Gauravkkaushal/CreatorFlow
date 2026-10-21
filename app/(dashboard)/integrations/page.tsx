'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Link2,
  Settings,
  Clock,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { Youtube } from '@/components/icons/youtube'
import { DEMO_CHANNEL } from '@/lib/demo-mode'
import { formatRelativeTime } from '@/lib/utils'

type SyncFrequency = '1h' | '6h' | '12h' | '24h' | 'manual'

const SYNC_FREQUENCY_LABELS: Record<SyncFrequency, string> = {
  '1h': 'Every 1 hour',
  '6h': 'Every 6 hours',
  '12h': 'Every 12 hours',
  '24h': 'Every 24 hours',
  'manual': 'Manual only',
}

const INTEGRATIONS = [
  {
    id: 'youtube',
    name: 'YouTube Data API',
    description: 'Sync your channel, videos, and comments for AI analysis.',
    icon: Youtube,
    color: 'text-red-600',
    bg: 'bg-red-50',
    status: 'demo' as const,
    scopes: ['Read channel info', 'Fetch recent videos', 'Access comments'],
  },
]

export default function IntegrationsPage() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('6h')
  const [connected, setConnected] = useState<string[]>([])
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  useEffect(() => {
    setLastSync(new Date(Date.now() - 2 * 60 * 60 * 1000))
  }, [])
  const [syncSuccess, setSyncSuccess] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setSyncSuccess(false)
    setTimeout(() => {
      setSyncing(false)
      setSyncSuccess(true)
      setTimeout(() => setSyncSuccess(false), 3000)
    }, 2500)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-300">Channel connection</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Connect the tools behind your content.</h1>
          <p className="text-sm text-slate-500 mt-1">Connect and manage your YouTube channel and API keys</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
          <Info className="w-3.5 h-3.5" /> Demo Mode Active
        </span>
      </div>

      {/* Demo mode notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Running in Demo Mode</p>
          <p className="text-xs text-amber-700 mt-0.5">
            No real API keys are configured. Add your <code className="bg-amber-100 px-1 rounded">YOUTUBE_API_KEY</code>, <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code>, and{' '}
            <code className="bg-amber-100 px-1 rounded">MONGODB_URI</code> to your <code className="bg-amber-100 px-1 rounded">.env.local</code> file to connect real data.
          </p>
          <button onClick={() => setShowSetupGuide((value) => !value)} className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-700 hover:text-amber-900">
            View setup guide <ExternalLink className="w-3 h-3" />
          </button>
          {showSetupGuide && <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-5 text-amber-800"><li>Create credentials in Google Cloud Console.</li><li>Add the required values to <code>.env.local</code>.</li><li>Restart the app, then connect your channel.</li></ol>}
        </div>
      </div>

      {/* Connected Channel */}
      <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-white">Connected Channel</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <img
              src={DEMO_CHANNEL.thumbnailUrl}
              alt={DEMO_CHANNEL.channelTitle}
              className="w-14 h-14 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">{DEMO_CHANNEL.channelTitle}</h3>
                <span className="badge bg-amber-100 text-amber-700">Demo</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{DEMO_CHANNEL.channelId}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-slate-500">{(DEMO_CHANNEL.subscriberCount / 1000).toFixed(1)}K subscribers</span>
                <span className="text-xs text-slate-500">{DEMO_CHANNEL.videoCount} videos</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /> Last sync {lastSync ? formatRelativeTime(lastSync) : '2 hours ago'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {syncSuccess && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synced!
                </span>
              )}
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>
          </div>

          {/* Sync progress */}
          {syncing && (
            <div className="mt-4 space-y-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs font-medium text-indigo-700">Syncing your channel data…</p>
              <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-[10px] text-indigo-500">Fetching latest videos and comments</p>
            </div>
          )}
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-white">Sync Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control how often your channel data is refreshed</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Sync Frequency</label>
            <div className="relative">
              <select
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value as SyncFrequency)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
              >
                {(Object.entries(SYNC_FREQUENCY_LABELS) as [SyncFrequency, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Auto-analyze new video comments', sub: 'Trigger AI analysis when new comments are detected', enabled: true },
              { label: 'Sync video performance stats', sub: 'Keep view counts and engagement metrics up to date', enabled: true },
              { label: 'Email summary reports', sub: 'Weekly digest of new audience topics and content ideas', enabled: false },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-700">{setting.label}</p>
                  <p className="text-[10px] text-slate-400">{setting.sub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Integrations list */}
      <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-white">API Connections</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.id} className="flex items-start gap-4 p-5">
              <div className={`w-11 h-11 ${integration.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <integration.icon className={`w-6 h-6 ${integration.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                  {connected.includes(integration.id) ? (
                    <span className="badge bg-green-100 text-green-700"><CheckCircle2 className="w-2.5 h-2.5" /> Connected</span>
                  ) : integration.status === 'demo' ? (
                    <span className="badge bg-amber-100 text-amber-700">Demo Mode</span>
                  ) : (
                    <span className="badge bg-green-100 text-green-700">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {integration.scopes.map((scope) => (
                    <span key={scope} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md">
                      <Shield className="w-2 h-2" /> {scope}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setConnected((current) => current.includes(integration.id) ? current.filter((id) => id !== integration.id) : [...current, integration.id])} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-300 text-sm text-slate-600 hover:text-indigo-700 rounded-lg transition-colors">
                <Link2 className="w-3.5 h-3.5" /> {connected.includes(integration.id) ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Environment variables guide */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-sm">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Required Environment Variables</h3>
        </div>
        <div className="space-y-2 font-mono text-xs">
          {[
            { key: 'YOUTUBE_API_KEY', desc: 'Google Cloud Console → APIs & Services', required: true },
            { key: 'GEMINI_API_KEY', desc: 'Google AI Studio → API Keys', required: true },
            { key: 'MONGODB_URI', desc: 'MongoDB Atlas connection string', required: true },
            { key: 'GOOGLE_CLIENT_ID', desc: 'Google OAuth 2.0 credentials', required: false },
            { key: 'GOOGLE_CLIENT_SECRET', desc: 'Google OAuth 2.0 credentials', required: false },
            { key: 'NEXTAUTH_SECRET', desc: 'Random string for session encryption', required: false },
          ].map(({ key, desc, required }) => (
            <div key={key} className="flex items-center gap-3">
              <code className="text-indigo-400">{key}</code>
              <span className="text-slate-500 flex-1"># {desc}</span>
              {required && <span className="text-xs text-red-400 font-sans">required</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
