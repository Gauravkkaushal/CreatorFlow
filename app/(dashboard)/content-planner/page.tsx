'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Clock3,
  GripVertical,
  MessageCircle,
  Plus,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react'
import { DEMO_CONTENT_IDEAS, DEMO_TOPICS, isClientDemoMode } from '@/lib/demo-mode'
import { useInsights } from '@/lib/use-insights'
import { useIdeas, useCreateIdea, useUpdateIdea, type Idea } from '@/lib/use-ideas'
import { formatDate } from '@/lib/utils'
import type { ContentIdea, ContentStatus, ContentType } from '@/types'

const isDemo = isClientDemoMode()

type WritingLanguage = 'english' | 'hinglish'
type ScriptResult = { outline: string[]; description: string; hook: string; cta: string }

const CREATOR_TEMPLATES = [
  { id: 'tutorial', title: 'Step-by-step tutorial', hint: 'Teach a process clearly from start to finish.' },
  { id: 'problem', title: 'Problem → solution', hint: 'Start with a pain point and show the fix.' },
  { id: 'story', title: 'Story / experience', hint: 'Share an insight through a personal narrative.' },
  { id: 'list', title: 'Tips & listicle', hint: 'Fast, useful ideas for quick viewer value.' },
] as const

type Project = Pick<ContentIdea, '_id' | 'title' | 'contentType' | 'status' | 'titleSuggestions' | 'outline' | 'keywords' | 'description' | 'sourceTopicId'> & {
  demand?: number
  due?: string
  color: string
  script?: ScriptResult
}

const stageOrder: ContentStatus[] = ['idea', 'draft', 'approved', 'scheduled', 'published']
const stages: Record<ContentStatus, { title: string; description: string; accent: string }> = {
  idea: { title: 'Ideas', description: 'Worth exploring', accent: 'bg-violet-400' },
  draft: { title: 'Writing', description: 'Outline & script', accent: 'bg-sky-400' },
  approved: { title: 'Producing', description: 'Film & edit', accent: 'bg-amber-400' },
  scheduled: { title: 'Scheduled', description: 'Ready to publish', accent: 'bg-emerald-400' },
  published: { title: 'Published', description: 'Track what worked', accent: 'bg-slate-400' },
}

const initialProjects: Project[] = [
  ...DEMO_CONTENT_IDEAS.map((idea, index) => ({
    ...idea,
    status: index === 0 ? 'draft' as const : 'approved' as const,
    demand: index === 0 ? 92 : 87,
    due: index === 0 ? 'Outline due today' : 'Film on Wednesday',
    color: index === 0 ? 'from-red-500 via-fuchsia-600 to-violet-900' : 'from-sky-500 via-indigo-700 to-violet-950',
  })),
  {
    _id: 'idea-3', title: 'File Uploads in Node.js: Multer + AWS S3', contentType: 'video', status: 'idea',
    titleSuggestions: ['Node.js File Upload Guide'], outline: ['Configure Multer', 'Connect S3', 'Secure uploads'],
    keywords: ['Node.js', 'AWS S3', 'Multer'], sourceTopicId: 'topic-3', description: 'A requested practical tutorial on secure uploads.', demand: 78, due: '14 viewer requests', color: 'from-orange-500 via-rose-600 to-fuchsia-950',
  },
  {
    _id: 'idea-4', title: 'Live Q&A: Fixing Auth Bugs Together', contentType: 'livestream', status: 'scheduled',
    titleSuggestions: [], outline: ['Welcome', 'Live fixes', 'Viewer Q&A'], keywords: ['JWT', 'Live coding'], description: 'A community live session built from repeated authentication questions.', demand: 74, due: 'Friday, 6:00 PM', color: 'from-rose-500 via-red-600 to-orange-950',
  },
  {
    _id: 'idea-5', title: 'REST vs GraphQL: When Each One Wins', contentType: 'video', status: 'published',
    titleSuggestions: [], outline: [], keywords: ['GraphQL', 'REST API'], description: 'Published last week. Strong conversation starter.', demand: 69, due: 'Published 6 days ago', color: 'from-emerald-500 via-teal-600 to-slate-950',
  },
]

const TYPE_COLORS: Record<ContentType, string> = {
  video: 'from-violet-500 via-fuchsia-600 to-indigo-950',
  short: 'from-sky-500 via-indigo-700 to-violet-950',
  livestream: 'from-rose-500 via-red-600 to-orange-950',
}

function toProject(idea: Idea): Project {
  return {
    _id: idea._id,
    title: idea.title,
    contentType: idea.contentType,
    status: idea.status,
    titleSuggestions: [],
    outline: idea.outline,
    keywords: idea.keywords,
    description: idea.description,
    due: idea.scheduledDate ? `Scheduled ${formatDate(idea.scheduledDate)}` : undefined,
    color: TYPE_COLORS[idea.contentType],
    script: idea.hook || idea.cta || idea.draftDescription
      ? { hook: idea.hook ?? '', cta: idea.cta ?? '', description: idea.draftDescription ?? '', outline: idea.outline }
      : undefined,
  }
}

export default function ContentPlannerPage() {
  const [demoProjects, setDemoProjects] = useState<Project[]>(initialProjects)
  const ideas = useIdeas(!isDemo)
  const createIdea = useCreateIdea()
  const updateIdea = useUpdateIdea()
  const projects = isDemo ? demoProjects : (ideas.data ?? []).map(toProject)
  const [showGenerator, setShowGenerator] = useState(false)
  const insights = useInsights(!isClientDemoMode())
  const audienceTopics = isClientDemoMode() ? DEMO_TOPICS : insights.data?.topics ?? []
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [writingLanguage, setWritingLanguage] = useState<WritingLanguage>('english')
  const [templateId, setTemplateId] = useState<typeof CREATOR_TEMPLATES[number]['id']>('tutorial')
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null)
  const activeRequestRef = useRef('')
  const selectedTemplate = CREATOR_TEMPLATES.find((item) => item.id === templateId) ?? CREATOR_TEMPLATES[0]

  useEffect(() => {
    const suggestedTopic = new URLSearchParams(window.location.search).get('topic')
    if (!suggestedTopic) return

    setTopic(suggestedTopic)
    setShowGenerator(true)
  }, [])

  const invalidateGeneration = () => {
    activeRequestRef.current = ''
    setGenerating(false)
    setScriptResult(null)
    setScriptError(null)
  }
  const moveProjectToStage = (id: string, status: ContentStatus) => {
    if (isDemo) setDemoProjects((current) => current.map((project) => project._id === id ? { ...project, status } : project))
    else updateIdea.mutate({ id, status })
    setSelectedProject((current) => current?._id === id ? { ...current, status } : current)
  }

  const moveProject = (id: string, direction: -1 | 1) => {
    const project = projects.find((item) => item._id === id)
    if (!project) return
    const nextIndex = Math.min(Math.max(stageOrder.indexOf(project.status) + direction, 0), stageOrder.length - 1)
    moveProjectToStage(id, stageOrder[nextIndex])
  }

  const closeGenerator = () => {
    setTopic('')
    setScriptResult(null)
    setShowGenerator(false)
  }

  const createProject = async () => {
    if (!topic.trim()) return
    if (!isDemo) {
      setGenerating(true)
      setScriptError(null)
      try {
        await createIdea.mutateAsync({
          title: topic.trim().slice(0, 200),
          contentType: 'video',
          status: 'idea',
          outline: scriptResult?.outline ?? [],
          keywords: topic.trim().split(/\s+/).slice(0, 3),
          description: 'A new idea ready for you to shape into a video.',
          draftDescription: scriptResult?.description,
          hook: scriptResult?.hook,
          cta: scriptResult?.cta,
          sourceTopicName: audienceTopics.some((t) => t.name === topic.trim()) ? topic.trim() : undefined,
        })
        closeGenerator()
      } catch (error) {
        setScriptError(error instanceof Error ? error.message : 'Could not save your idea')
      } finally {
        setGenerating(false)
      }
      return
    }
    setGenerating(true)
    window.setTimeout(() => {
      setDemoProjects((current) => [{
        _id: 'idea-' + Date.now(), title: topic.trim() + ': Complete Creator Guide', contentType: 'video', status: 'idea',
        titleSuggestions: [], outline: scriptResult?.outline ?? ['The audience problem', 'Core concept', 'Practical walkthrough', 'Common mistakes'],
        keywords: topic.trim().split(' ').slice(0, 3), description: scriptResult?.description ?? 'A new AI-assisted idea ready for you to shape into a video.', script: scriptResult ?? undefined,
        demand: 80, due: 'New audience signal', color: 'from-violet-500 via-fuchsia-600 to-indigo-950',
      }, ...current])
      setTopic('')
      setScriptResult(null)
      activeRequestRef.current = ''
      setGenerating(false)
      setShowGenerator(false)
    }, 700)
  }

  const generateWriting = async () => {
    if (!topic.trim()) return
    setGenerating(true)
    setScriptError(null)
    const currentTopic = topic.trim()
    const currentTemplateId = templateId
    const currentLanguage = writingLanguage
    // Assign a unique ID per invocation so older requests never match again even if inputs repeat
    const requestId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    activeRequestRef.current = requestId

    try {
      const title = `${currentTopic} — ${selectedTemplate.title}`
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, keywords: currentTopic.split(/\s+/).slice(0, 5), language: currentLanguage }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Could not generate your content')
      // Discard responses for superseded generator inputs
      if (activeRequestRef.current === requestId) {
        setScriptResult(payload.data)
      }
    } catch (error) {
      if (activeRequestRef.current === requestId) {
        setScriptError(error instanceof Error ? error.message : 'Could not generate your content')
      }
    } finally {
      if (activeRequestRef.current === requestId) {
        setGenerating(false)
      }
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 animate-fade-in">
      <header className="flex justify-end">
        <button onClick={() => setShowGenerator(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-400">
          <WandSparkles className="h-4 w-4" /> Create from an idea
        </button>
      </header>

      {(ideas.error || updateIdea.error) && (
        <div role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {(ideas.error ?? updateIdea.error)?.message}
        </div>
      )}
      {ideas.isLoading && <p role="status" className="text-sm text-slate-400">Loading your ideas…</p>}

      <section className="overflow-x-auto pb-3">
        <div className="grid min-w-[1360px] grid-cols-5 gap-4">
          {stageOrder.map((status) => {
            const stage = stages[status]
            const stageProjects = projects.filter((project) => project.status === status)
            return (
              <div
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedProjectId) moveProjectToStage(draggedProjectId, status)
                  setDraggedProjectId(null)
                }}
                className={'kanban-column flex min-h-[590px] flex-col rounded-2xl border border-white/8 bg-[#10162a]/80 p-3 transition ' + (draggedProjectId ? 'kanban-column-active' : '')}
              >
                <div className="mb-4 flex items-start justify-between px-1 pt-1">
                  <div><div className="flex items-center gap-2"><span className={'h-2 w-2 rounded-full ' + stage.accent} /><h2 className="text-sm font-semibold text-white">{stage.title}</h2><span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-slate-300">{stageProjects.length}</span></div><p className="mt-1 text-[11px] text-slate-500">{stage.description}</p></div>
                  <button onClick={() => setShowGenerator(true)} className="rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label={'Add ' + stage.title + ' project'}><Plus className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  {stageProjects.map((project) => (
                    <article
                      key={project._id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', project._id)
                        setDraggedProjectId(project._id)
                      }}
                      onDragEnd={() => setDraggedProjectId(null)}
                      className={'kanban-card group overflow-hidden rounded-xl border border-white/8 bg-[#151b2e] shadow-lg shadow-black/10 transition hover:border-violet-400/40 hover:shadow-violet-950/30 ' + (draggedProjectId === project._id ? 'kanban-card-dragging' : '')}
                    >
                      <div className={'relative h-20 bg-gradient-to-br ' + project.color}><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,.3),transparent_22%)]" /><span className="absolute left-3 top-3 rounded-md bg-black/25 px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">{project.contentType}</span><GripVertical className="absolute right-2 top-2 h-4 w-4 text-white/50" /></div>
                      <div className="p-3.5">
                        <button onClick={() => setSelectedProject(project)} className="text-left text-sm font-semibold leading-5 text-white transition hover:text-violet-200">{project.title}</button>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{project.description}</p>
                        <div className="mt-4 flex items-center justify-between">{project.demand !== undefined && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-300"><MessageCircle className="h-3 w-3" /> {project.demand} demand</span>}{project.due && <span className="inline-flex max-w-[130px] truncate items-center gap-1 text-[10px] text-slate-500"><Clock3 className="h-3 w-3" /> {project.due}</span>}</div>
                        <div className="mt-3 flex gap-1 border-t border-white/7 pt-3"><button disabled={status === 'idea'} onClick={() => moveProject(project._id, -1)} className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">Back</button><button onClick={() => setSelectedProject(project)} className="flex-1 rounded-md bg-white/[0.05] px-2 py-1.5 text-[10px] font-semibold text-slate-200 transition hover:bg-violet-500/20 hover:text-white">Open</button><button disabled={status === 'published'} onClick={() => moveProject(project._id, 1)} className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-violet-300 transition hover:bg-violet-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">Move</button></div>
                      </div>
                    </article>
                  ))}
                </div>
                {status === 'idea' && <button onClick={() => setShowGenerator(true)} className="mt-3 flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 text-xs font-medium text-slate-500 transition hover:border-violet-400/40 hover:bg-violet-500/[0.06] hover:text-violet-200"><Plus className="h-4 w-4" /> Add an idea</button>}
              </div>
            )
          })}
        </div>
      </section>

      {showGenerator && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setShowGenerator(false)}
        >
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151b2e] shadow-2xl shadow-black/50 animate-slide-up">
            <div className="shrink-0 flex items-center justify-between border-b border-white/8 p-5">
              <div><p className="text-sm font-semibold text-white">Create a new video idea</p><p className="mt-1 text-xs text-slate-400">Start with an audience request or any topic you want to own.</p></div>
              <button onClick={() => setShowGenerator(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
              <div>
                <label className="text-xs font-semibold text-slate-300">What should this video be about?</label>
                <input
                  autoFocus
                  value={topic}
                  onChange={(event) => {
                    setTopic(event.target.value)
                    invalidateGeneration()
                  }}
                  placeholder="e.g. JWT authentication for beginners"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15"
                />
              </div>
              {audienceTopics.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300">Audience signals</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {audienceTopics.map((audienceTopic) => (
                      <button
                        key={audienceTopic._id}
                        onClick={() => {
                          setTopic(audienceTopic.name)
                          invalidateGeneration()
                        }}
                        className={'rounded-lg border px-2.5 py-1.5 text-[11px] transition ' + (topic === audienceTopic.name ? 'border-violet-400 bg-violet-500/20 text-white' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white')}
                      >
                        {audienceTopic.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!scriptResult && (
                <div>
                  <p className="text-xs font-semibold text-slate-300">1. Choose a creator template</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {CREATOR_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setTemplateId(template.id)
                          invalidateGeneration()
                        }}
                        className={'rounded-xl border p-3 text-left transition ' + (templateId === template.id ? 'border-violet-400 bg-violet-500/15' : 'border-white/10 bg-white/[0.03] hover:border-white/25')}
                      >
                        <p className="text-xs font-semibold text-white">{template.title}</p>
                        <p className="mt-1 text-[10px] leading-4 text-slate-400">{template.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {scriptResult && (
                <div className="max-h-80 overflow-y-auto rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4 pr-3">
                  <p className="sticky top-0 bg-[#1a2038] pb-2 text-xs font-semibold text-violet-200">{selectedTemplate.title} · {writingLanguage === 'hinglish' ? 'Hinglish' : 'English'} draft</p>
                  <div className="mt-1 grid gap-3 text-xs leading-5 text-slate-300">
                    <div><p className="font-semibold text-white">Hook</p><p>{scriptResult.hook}</p></div>
                    <div><p className="font-semibold text-white">Description</p><p className="whitespace-pre-line">{scriptResult.description}</p></div>
                    <div><p className="font-semibold text-white">Script flow</p><ol className="mt-1 space-y-1">{scriptResult.outline.map((item, index) => <li key={item}>{index + 1}. {item}</li>)}</ol></div>
                    <div><p className="font-semibold text-white">CTA</p><p>{scriptResult.cta}</p></div>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-300">{scriptResult ? 'Change language or regenerate' : '2. Choose writing language'}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setWritingLanguage('english')
                      invalidateGeneration()
                    }}
                    className={'rounded-lg px-3 py-2 text-xs font-semibold transition ' + (writingLanguage === 'english' ? 'bg-violet-500 text-white' : 'bg-white/[0.05] text-slate-400')}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setWritingLanguage('hinglish')
                      invalidateGeneration()
                    }}
                    className={'rounded-lg px-3 py-2 text-xs font-semibold transition ' + (writingLanguage === 'hinglish' ? 'bg-violet-500 text-white' : 'bg-white/[0.05] text-slate-400')}
                  >
                    Hinglish
                  </button>
                  <button onClick={generateWriting} disabled={!topic.trim() || generating} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-violet-400/50 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-500/15 disabled:opacity-40">
                    <Sparkles className="h-3.5 w-3.5" /> {generating ? 'Writing…' : 'Generate script'}
                  </button>
                </div>
              </div>
              {scriptError && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{scriptError}</p>}
            </div>
            <div className="shrink-0 flex gap-3 border-t border-white/8 bg-[#151b2e] p-5">
              <button onClick={() => setShowGenerator(false)} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5">Cancel</button>
              <button onClick={createProject} disabled={!topic.trim() || generating} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50">
                {generating ? 'Creating…' : <><Sparkles className="h-4 w-4" /> Create project</>}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {selectedProject && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && setSelectedProject(null)}><div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#151b2e] shadow-2xl shadow-black/50 animate-slide-up"><div className="flex items-start justify-between border-b border-white/8 p-5"><div><span className="rounded-md bg-violet-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-200">{stages[selectedProject.status].title}</span><h2 className="mt-3 text-lg font-semibold text-white">{selectedProject.title}</h2></div><button onClick={() => setSelectedProject(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button></div><div className="overflow-y-auto p-5"><p className="text-sm leading-6 text-slate-300">{selectedProject.description}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{selectedProject.demand !== undefined && <div className="rounded-xl border border-white/8 bg-[#0b1020] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Audience demand</p><p className="mt-2 text-2xl font-bold text-white">{selectedProject.demand}<span className="text-sm text-slate-500">/100</span></p></div>}<div className="rounded-xl border border-white/8 bg-[#0b1020] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next step</p><p className="mt-2 text-sm font-semibold text-slate-200">{stages[selectedProject.status].description}</p></div></div><h3 className="mt-6 text-sm font-semibold text-white">Video outline</h3><ol className="mt-3 space-y-2">{(selectedProject.outline || []).map((step, index) => <li key={step} className="flex gap-3 text-sm text-slate-300"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-200">{index + 1}</span>{step}</li>)}</ol><ProjectScript project={selectedProject} /></div><div className="flex gap-3 border-t border-white/8 p-5"><button onClick={() => setSelectedProject(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5">Close</button><button onClick={() => moveProject(selectedProject._id, 1)} disabled={selectedProject.status === 'published'} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-40">Move forward <ArrowRight className="h-4 w-4" /></button></div></div></div>}
    </div>
  )
}

function ProjectScript({ project }: { project: Project }) {
  const script = project.script
  const fallbackHook = project.outline?.[0] ?? `In this video, we'll cover ${project.title}.`
  const fallbackCta = 'If this helped, like the video, subscribe, and share your questions in the comments.'

  return <section className="mt-7 rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4">
    <p className="text-sm font-semibold text-white">Script draft</p>
    <p className="mt-1 text-xs text-violet-200">Use this while recording, then edit it in your own voice.</p>
    <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-200">Hook</p><p>{script?.hook ?? fallbackHook}</p></div>
      {script?.description && <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-200">Description</p><p className="whitespace-pre-line">{script.description}</p></div>}
      <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-200">Talking points</p><ol className="mt-1 space-y-1">{(script?.outline ?? project.outline ?? []).map((step, index) => <li key={step}>{index + 1}. {step}</li>)}</ol></div>
      <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-200">CTA</p><p>{script?.cta ?? fallbackCta}</p></div>
    </div>
  </section>
}
