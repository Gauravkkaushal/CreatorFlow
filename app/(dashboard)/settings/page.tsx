'use client'

import { useState } from 'react'
import { isClientDemoMode } from '@/lib/demo-mode'
import {
  User,
  Settings,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Save,
  Moon,
  Bell,
  Shield,
  CheckCircle2,
  Info,
} from 'lucide-react'

type TabKey = 'profile' | 'ai' | 'notifications' | 'security'

const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile & Persona', icon: User },
  { key: 'ai', label: 'AI Preferences', icon: Sparkles },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
]

const AI_MODELS = [
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Fast and efficient. Best for quick analysis.', badge: 'Default' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'More capable for complex analysis. Slower.', badge: 'Pro' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Profile form
  const [name, setName] = useState('TechCreator Pro')
  const [email, setEmail] = useState('creator@example.com')
  const [channelName, setChannelName] = useState('TechCreator Pro')
  const [tone, setTone] = useState('Educational & Engaging')
  const [targetAudience, setTargetAudience] = useState('Intermediate JavaScript & Python developers')
  const [niche, setNiche] = useState('Web Development & Programming Tutorials')
  const [timezone, setTimezone] = useState('America/New_York')

  // AI prefs
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
  const [geminiKey, setGeminiKey] = useState('')
  const [demoMode, setDemoMode] = useState(isClientDemoMode())
  const [ideaCount, setIdeaCount] = useState(3)

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [newTopicAlert, setNewTopicAlert] = useState(false)
  const [securityNotice, setSecurityNotice] = useState<string | null>(null)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-300">Workspace settings</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Make CreatorFlow fit your channel.</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your profile, AI preferences, and account settings</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Changes saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-52 shrink-0">
          <nav className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-slate-50 last:border-0 transition-colors ${
                  activeTab === tab.key
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile & Persona */}
          {activeTab === 'profile' && (
            <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-base font-semibold text-white">Profile & Channel Persona</h2>
                <p className="text-xs text-slate-500 mt-0.5">This information is used to personalize AI-generated content</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Channel Name</label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Niche</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Web Development & Programming"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Channel Tone & Style</label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g. Educational & Engaging, Casual & Fun"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">AI will use this tone when generating scripts and titles</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Audience Demographics</label>
                  <textarea
                    rows={2}
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Intermediate JavaScript developers aged 22-35"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                  >
                    {['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* AI Preferences */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-white">AI Model Preferences</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select the AI model for analysis and content generation</p>
                </div>
                <div className="p-5 space-y-3">
                  {AI_MODELS.map((model) => (
                    <label
                      key={model.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedModel === model.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ai-model"
                        value={model.id}
                        checked={selectedModel === model.id}
                        onChange={() => setSelectedModel(model.id)}
                        className="accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{model.label}</span>
                          {model.badge && (
                            <span className={`badge text-xs ${model.badge === 'Default' ? 'bg-green-100 text-green-700' : 'bg-violet-100 text-violet-700'}`}>
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{model.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-white">API Key Management</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">API keys set here override environment variables. For production, prefer environment variables in <code className="bg-blue-100 px-1 rounded">.env.local</code>.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gemini API Key</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          placeholder="AIza…"
                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                        />
                      </div>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3 py-2.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ideas per Generation</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1} max={5} step={1}
                        value={ideaCount}
                        onChange={(e) => setIdeaCount(Number(e.target.value))}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="text-sm font-semibold text-indigo-600 w-6 text-center">{ideaCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo mode toggle */}
              <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Demo Mode</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Use mock data instead of real API calls</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={demoMode}
                      onChange={(e) => setDemoMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>
                {demoMode && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Demo mode is active. Disable to use real API data.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { label: 'Email notifications', sub: 'Receive updates about new audience topics', value: emailNotifs, setter: setEmailNotifs },
                  { label: 'Weekly content digest', sub: 'Summary of insights and ideas every Monday', value: weeklyDigest, setter: setWeeklyDigest },
                  { label: 'New topic alerts', sub: 'Get notified when a high-priority topic is detected', value: newTopicAlert, setter: setNewTopicAlert },
                ].map(({ label, sub, value, setter }) => (
                  <div key={label} className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-white">Account Security</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Google OAuth Active</p>
                      <p className="text-xs text-green-600">Your account is secured with Google Sign-In</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-800">OAuth Token</p>
                      <p className="text-xs text-slate-500">Revoke YouTube API access and re-authenticate</p>
                    </div>
                    <button onClick={() => setSecurityNotice('YouTube access reset started. Sign in again to reconnect your channel.')} className="px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors">
                      Re-authenticate
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Delete Account</p>
                      <p className="text-xs text-slate-500">Permanently remove your account and all data</p>
                    </div>
                    <button onClick={() => setSecurityNotice('For your protection, account deletion requires support confirmation. No data has been removed.')} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
                {securityNotice && <div role="status" className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200">{securityNotice}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
