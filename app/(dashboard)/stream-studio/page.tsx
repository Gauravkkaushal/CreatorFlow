'use client'

import { useState } from 'react'
import {
  Radio,
  Plus,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  Circle,
  ChevronDown,
  Mic,
  Monitor,
  Image as ImageIcon,
  ListChecks,
  Info,
  Calendar,
  Wand2,
} from 'lucide-react'
import { DEMO_BROADCASTS, DEMO_TOPICS, isClientDemoMode } from '@/lib/demo-mode'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useIdeas, useCreateIdea } from '@/lib/use-ideas'

const isDemo = isClientDemoMode()
const audienceTopics = isDemo ? DEMO_TOPICS : []
import { formatDate } from '@/lib/utils'

// ─── Pre-stream checklist ───────────────────────────────────────────────────
const DEFAULT_CHECKLIST = [
  { id: 'c1', label: 'Test audio levels and microphone', category: 'audio', done: false },
  { id: 'c2', label: 'Check camera focus and lighting', category: 'video', done: false },
  { id: 'c3', label: 'Set up stream overlays and alerts', category: 'overlay', done: false },
  { id: 'c4', label: 'Prepare thumbnail and title card', category: 'thumbnail', done: false },
  { id: 'c5', label: 'Test internet connection stability', category: 'technical', done: false },
  { id: 'c6', label: 'Prepare coding environment / screen share', category: 'technical', done: false },
  { id: 'c7', label: 'Draft chat engagement prompts', category: 'engagement', done: false },
  { id: 'c8', label: 'Schedule and promote on social media', category: 'promotion', done: true },
]

const CHECKLIST_ICONS: Record<string, typeof Mic> = {
  audio: Mic, video: Monitor, overlay: Monitor, thumbnail: ImageIcon,
  technical: Monitor, engagement: Radio, promotion: Radio,
}

// ─── Mock stream templates ──────────────────────────────────────────────────
const STREAM_TEMPLATES = [
  { id: 'tmpl-1', name: 'Live Coding Session', title: 'Live: Building {Topic} from Scratch', description: 'Join me for a live coding session!', category: 'Technology' },
  { id: 'tmpl-2', name: 'Q&A Deep Dive', title: 'Q&A: Answering Your {Topic} Questions', description: 'Let\'s tackle your questions live!', category: 'Education' },
]

export default function StreamStudioPage() {
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [showNewStream, setShowNewStream] = useState(false)
  const [showAgendaModal, setShowAgendaModal] = useState<typeof DEMO_BROADCASTS[0] | null>(null)
  const [generatingAgenda, setGeneratingAgenda] = useState(false)
  const [generatedAgenda, setGeneratedAgenda] = useState<string | null>(null)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [streamTopic, setStreamTopic] = useState('')
  const [duration, setDuration] = useState(90)
  const [notice, setNotice] = useState<string | null>(null)
  const [streamStart, setStreamStart] = useState('')
  const ideas = useIdeas(!isDemo)
  const createIdea = useCreateIdea()
  // Live streams are saved as livestream ideas, so they also show on the calendar and planner
  const broadcasts = isDemo
    ? DEMO_BROADCASTS
    : (ideas.data ?? []).filter((idea) => idea.contentType === 'livestream').map((idea) => ({
        _id: idea._id,
        title: idea.title,
        description: idea.description ?? '',
        scheduledStartTime: new Date(idea.scheduledDate ?? idea.createdAt),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'local' as const,
        isDemo: false,
        agenda: idea.outline,
      }))

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 3500)
  }

  const applyTemplate = (template: typeof STREAM_TEMPLATES[number]) => {
    const topic = streamTopic || audienceTopics[0]?.name || 'your topic'
    setStreamTopic(topic)
    setStreamTitle(template.title.replace('{Topic}', topic))
    setStreamDescription(template.description)
    setShowNewStream(true)
  }

  const doneCount = checklist.filter((c) => c.done).length
  const completionPct = Math.round((doneCount / checklist.length) * 100)

  const toggleCheck = (id: string) => {
    setChecklist((prev) => prev.map((c) => c.id === id ? { ...c, done: !c.done } : c))
  }

  const handleGenerateAgenda = (broadcast: typeof DEMO_BROADCASTS[0]) => {
    setShowAgendaModal(broadcast)
    setGeneratingAgenda(true)
    setGeneratedAgenda(null)
    setTimeout(() => {
      setGeneratingAgenda(false)
      setGeneratedAgenda(`# ${broadcast.title}\n\n## Stream Agenda (${duration} min)\n\n${broadcast.agenda?.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n## Suggested Chat Questions\n- "What's your experience with this topic?"\n- "Drop a 🔥 if you're learning something new!"\n- "What should I cover next?"`)
    }, 1800)
  }

  const handleGenerateTitle = () => {
    if (!streamTopic) return
    const titles = [
      `Live: Building ${streamTopic} from Scratch`,
      `🔴 LIVE: ${streamTopic} — Q&A + Demo`,
      `Coding Live: Complete ${streamTopic} Tutorial`,
    ]
    setStreamTitle(titles[Math.floor(Math.random() * titles.length)])
    setStreamDescription(`Join me live as we deep-dive into ${streamTopic}! We'll cover core concepts, live coding, and I'll answer your questions in real-time. Don't miss it!\n\n🔔 Subscribe to get notified when I go live!`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-300">Live studio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Prepare your next live moment.</h1>
          <p className="text-sm text-slate-500 mt-1">Plan, prepare, and launch your live streams</p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
              <Info className="w-3.5 h-3.5" /> Demo Mode
            </span>
          )}
          <button
            onClick={() => setShowNewStream(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Plan Stream
          </button>
        </div>
      </div>
      {notice && <div role="status" className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">{notice}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Upcoming streams */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-white">Upcoming Live Streams</h2>
          {broadcasts.length === 0 && (
            <EmptyState icon={Radio} title="No live streams planned" description="Plan a stream to build its agenda, checklist and title ideas here." />
          )}
          {broadcasts.map((broadcast) => (
            <div key={broadcast._id} className="bg-[#151b2e] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/10 hover:border-violet-400/40 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Radio className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{broadcast.title}</h3>
                    <span className="badge bg-amber-100 text-amber-700">Scheduled</span>
                    {broadcast.isDemo && <span className="badge bg-slate-100 text-slate-500">Demo</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{broadcast.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" /> {formatDate(broadcast.scheduledStartTime)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" /> {broadcast.timezone}
                    </span>
                  </div>

                  {/* Agenda preview */}
                  {broadcast.agenda && (
                    <div className="mt-3 space-y-1">
                      {broadcast.agenda.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="w-4 h-4 rounded-full gradient-bg flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                            {i + 1}
                          </div>
                          {item}
                        </div>
                      ))}
                      {broadcast.agenda.length > 3 && (
                        <p className="text-xs text-slate-400 pl-6">+{broadcast.agenda.length - 3} more agenda items</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                <button
                  onClick={() => handleGenerateAgenda(broadcast)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" /> AI Agenda Planner
                </button>
                <button onClick={() => showNotice(`Live control room opened for “${broadcast.title}”.`)} className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" /> Go Live
                </button>
              </div>
            </div>
          ))}

          {/* Empty state / add */}
          <button
            onClick={() => setShowNewStream(true)}
            className="w-full bg-[#151b2e] border-2 border-dashed border-white/10 rounded-2xl p-6 flex items-center justify-center gap-2 hover:border-violet-400/40 hover:bg-violet-500/[0.06] transition-all group"
          >
            <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="text-sm text-slate-400 group-hover:text-indigo-600 font-medium transition-colors">Schedule a new stream</span>
          </button>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Pre-stream checklist */}
          <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-white">Pre-Stream Checklist</h3>
              </div>
              <span className={`text-xs font-semibold ${completionPct === 100 ? 'text-green-600' : 'text-indigo-600'}`}>
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="p-4">
              <div className="h-1.5 bg-slate-100 rounded-full mb-4">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="space-y-2">
                {checklist.map((item) => {
                  const Icon = CHECKLIST_ICONS[item.category] || Circle
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        item.done ? 'opacity-60' : 'hover:bg-slate-50'
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {completionPct === 100 && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-700">You&apos;re ready to go live! 🎉</span>
                </div>
              )}
            </div>
          </div>

          {/* Stream templates */}
          <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-white">Stream Templates</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {STREAM_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="flex items-center gap-3 p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{tmpl.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{tmpl.category}</p>
                  </div>
                  <button onClick={() => applyTemplate(tmpl)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Use</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Stream Modal */}
      {showNewStream && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowNewStream(false)}>
          <div className="bg-[#151b2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-white">AI Stream Planner</h2>
              </div>
              <button onClick={() => setShowNewStream(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stream Topic</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. JWT Authentication, React Hooks…"
                    value={streamTopic}
                    onChange={(e) => setStreamTopic(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  <button
                    onClick={handleGenerateTitle}
                    disabled={!streamTopic}
                    className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> AI
                  </button>
                </div>
                {/* From audience topics */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {audienceTopics.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => setStreamTopic(t.name)}
                      className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Stream title"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              {streamDescription && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description (AI-generated)</label>
                  <textarea
                    rows={4}
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  />
                </div>
              )}
              <div>
                <label htmlFor="stream-start" className="block text-xs font-semibold text-slate-700 mb-1.5">Date &amp; time{!isDemo && ' (required)'}</label>
                <input
                  id="stream-start"
                  type="datetime-local"
                  value={streamStart}
                  onChange={(e) => setStreamStart(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration: {duration} min</label>
                <input
                  type="range"
                  min={30}
                  max={180}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>30 min</span><span>180 min</span>
                </div>
              </div>
            </div>
            {createIdea.error && <p role="alert" className="mx-5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{createIdea.error.message}</p>}
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowNewStream(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                disabled={createIdea.isPending || (!isDemo && !streamStart)}
                onClick={async () => {
                  if (!streamTitle.trim()) return showNotice('Add a stream title before scheduling.')
                  if (!isDemo) {
                    try {
                      await createIdea.mutateAsync({
                        title: streamTitle.trim().slice(0, 200),
                        contentType: 'livestream',
                        status: 'scheduled',
                        description: streamDescription.slice(0, 1000),
                        scheduledDate: new Date(streamStart).toISOString(),
                        notes: `Duration: ${duration} min`,
                        sourceTopicName: streamTopic || undefined,
                      })
                    } catch {
                      return // createIdea.error is shown above the buttons
                    }
                    setStreamStart('')
                  }
                  setShowNewStream(false)
                  showNotice(`“${streamTitle}” has been scheduled for your publishing calendar.`)
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Calendar className="w-4 h-4" /> {createIdea.isPending ? 'Scheduling…' : 'Schedule Stream'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Modal */}
      {showAgendaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowAgendaModal(null)}>
          <div className="bg-[#151b2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-white">AI Stream Agenda</h2>
              <button onClick={() => setShowAgendaModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {generatingAgenda ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Building your agenda…</p>
                </div>
              ) : generatedAgenda ? (
                <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {generatedAgenda}
                </pre>
              ) : null}
            </div>
            {generatedAgenda && (
              <div className="p-5 border-t border-slate-100">
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedAgenda!); setShowAgendaModal(null) }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Copy Agenda
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
