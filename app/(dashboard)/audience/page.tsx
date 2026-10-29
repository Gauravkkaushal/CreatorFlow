'use client'

import { useState } from 'react'
import {
  MessageSquare,
  TrendingUp,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  Sparkles,
  ThumbsUp,
  Minus,
  ThumbsDown,
  ArrowRight,
  Search,
  BarChart2,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { DEMO_TOPICS, DEMO_VIDEOS, isClientDemoMode } from '@/lib/demo-mode'
import { EmptyState } from '@/components/dashboard/empty-state'

// ─── Mock sentiment data ───────────────────────────────────────────────────
const SENTIMENT = { positive: 62, neutral: 24, negative: 14 }
const KEYWORDS = [
  { word: 'JWT', count: 23 }, { word: 'authentication', count: 21 },
  { word: 'React', count: 19 }, { word: 'Server Components', count: 17 },
  { word: 'Node.js', count: 15 }, { word: 'TypeScript', count: 13 },
  { word: 'Next.js', count: 12 }, { word: 'file uploads', count: 11 },
  { word: 'GraphQL', count: 9 }, { word: 'REST API', count: 8 },
]

const QUESTIONS = [
  { id: 'q1', text: 'How do I implement JWT refresh tokens?', videoId: 'demo-video-1', author: 'Alex Chen', likes: 45, answered: false },
  { id: 'q2', text: 'What is the secure way to store JWTs in a browser?', videoId: 'demo-video-1', author: 'Tom Wilson', likes: 26, answered: false },
  { id: 'q3', text: 'When should I use Server Components vs Client Components?', videoId: 'demo-video-2', author: 'James Kim', likes: 41, answered: false },
  { id: 'q4', text: 'How do Server Components affect bundle size?', videoId: 'demo-video-2', author: 'Rachel Brown', likes: 35, answered: false },
  { id: 'q5', text: 'How to upload files to AWS S3 from Node.js?', videoId: 'demo-video-1', author: 'Maria Garcia', likes: 38, answered: true },
  { id: 'q6', text: 'What is Multer and how do I use it?', videoId: 'demo-video-3', author: 'David Lee', likes: 29, answered: false },
]

export default function AudiencePage() {
  const [selectedVideo, setSelectedVideo] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'topics' | 'questions' | 'keywords'>('topics')
  const [generatingIdea, setGeneratingIdea] = useState<string | null>(null)

  const filteredQuestions = QUESTIONS.filter((q) => {
    const matchVideo = selectedVideo === 'all' || q.videoId === selectedVideo
    const matchSearch = !searchQuery || q.text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchVideo && matchSearch
  })

  const handleGenerateIdea = (topicId: string) => {
    setGeneratingIdea(topicId)
    setTimeout(() => setGeneratingIdea(null), 1500)
  }

  const maxKeyword = KEYWORDS[0].count

  if (!isClientDemoMode()) {
    return (
      <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
        <div>
          <p className="text-sm font-medium text-violet-300">Audience signals</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">What your viewers want next.</h1>
        </div>
        <EmptyState icon={MessageSquare} title="No audience analysis yet" description="Comment analysis is coming next. Once your channel is synced, the topics, questions and keywords your viewers mention will appear here." href="/integrations" cta="Go to integrations" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-300">Audience signals</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">What your viewers want next.</h1>
          <p className="text-sm text-slate-500 mt-1">Analyze what your audience wants — turn insights into content</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
            <Info className="w-3.5 h-3.5" /> Demo Data
          </span>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Connect YouTube
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Comments Analyzed', value: '847', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Topics Identified', value: '12', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Unanswered Questions', value: '5', icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Content Opportunities', value: '8', icon: Lightbulb, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#151b2e] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/10">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Sentiment + Keywords Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sentiment */}
        <div className="bg-[#151b2e] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-white">Sentiment Distribution</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Positive', pct: SENTIMENT.positive, icon: ThumbsUp, color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Neutral', pct: SENTIMENT.neutral, icon: Minus, color: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100' },
              { label: 'Negative', pct: SENTIMENT.negative, icon: ThumbsDown, color: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-3.5 h-3.5 ${s.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200">{s.label}</span>
                    <span className={`font-semibold ${s.text}`}>{s.pct}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Based on 847 comments across 3 videos</p>
        </div>

        {/* Top Keywords */}
        <div className="bg-[#151b2e] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-white">Top Requested Keywords</h2>
          </div>
          <div className="space-y-2">
            {KEYWORDS.slice(0, 8).map((kw) => (
              <div key={kw.word} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-32 shrink-0 truncate">{kw.word}</span>
                <div className="flex-1 h-5 bg-white/10 rounded-md overflow-hidden">
                  <div
                    className="h-5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-md flex items-center pl-2 transition-all duration-700"
                    style={{ width: `${(kw.count / maxKeyword) * 100}%` }}
                  >
                    <span className="text-[10px] text-white font-semibold">{kw.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#151b2e] border border-white/8 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="flex border-b border-white/8">
          {(['topics', 'questions', 'keywords'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-violet-200 border-b-2 border-violet-400 bg-violet-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'topics' ? 'Audience Topics' : tab === 'questions' ? 'Unanswered Questions' : 'Content Requests'}
            </button>
          ))}
        </div>

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {DEMO_TOPICS.map((topic, i) => (
              <div key={topic._id} className="rounded-2xl border border-white/8 bg-[#10162a] p-4 transition hover:-translate-y-0.5 hover:border-violet-400/45 hover:bg-[#18213a] group">
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white">{topic.name}</h3>
                        <span className="badge border border-violet-400/20 bg-violet-500/15 text-violet-200">
                          Score: {topic.priorityScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{topic.summary}</p>
                      <div className="mt-3 rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2">
                        {topic.commonQuestions.slice(0, 2).map((q, qi) => (
                          <span key={qi} className="flex items-start gap-1.5 text-[11px] leading-4 text-slate-300 first:mb-1.5">
                            <HelpCircle className="mt-0.5 w-3 h-3 shrink-0 text-violet-300" /> {q}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">{topic.commentCount} mentions</span>
                        <div className="flex-1 max-w-24 h-1.5 bg-white/10 rounded-full">
                          <div
                            className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            style={{ width: `${topic.priorityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/content-planner?topic=${encodeURIComponent(topic.name)}`}
                    onClick={() => handleGenerateIdea(topic._id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      generatingIdea === topic._id
                        ? 'bg-violet-500/20 text-violet-200 cursor-wait'
                        : 'bg-violet-500 text-white hover:bg-violet-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {generatingIdea === topic._id ? 'Generating…' : 'Turn into Idea'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white"
                >
                  <option value="all">All Videos</option>
                  {DEMO_VIDEOS.map((v) => (
                    <option key={v.id} value={v.id}>{v.title.slice(0, 40)}…</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              {filteredQuestions.map((q) => {
                const video = DEMO_VIDEOS.find((v) => v.id === q.videoId)
                return (
                  <div key={q.id} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
                    q.answered ? 'border-green-100 bg-green-50/50' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20'
                  }`}>
                    <HelpCircle className={`w-4 h-4 mt-0.5 shrink-0 ${q.answered ? 'text-green-500' : 'text-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{q.author}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{q.likes} likes</span>
                        {video && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-indigo-600 truncate max-w-32">{video.title.slice(0, 30)}…</span>
                          </>
                        )}
                      </div>
                    </div>
                    {q.answered ? (
                      <span className="badge bg-green-100 text-green-700 shrink-0">Answered</span>
                    ) : (
                      <Link
                        href={`/content-planner?topic=${encodeURIComponent(q.text)}`}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> Answer with Video
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Keywords/Content Requests Tab */}
        {activeTab === 'keywords' && (
          <div className="p-5">
            <p className="text-sm text-slate-500 mb-4">Content ideas clustered from audience comment requests:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {DEMO_TOPICS.map((topic) => (
                <div key={topic._id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">{topic.name}</h4>
                    <span className="badge bg-violet-100 text-violet-700 shrink-0">{topic.commentCount} requests</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {topic.suggestedIdeas.map((idea, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                        <Lightbulb className="w-2.5 h-2.5" /> {idea.slice(0, 35)}{idea.length > 35 ? '…' : ''}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/content-planner?topic=${encodeURIComponent(topic.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 group-hover:gap-2 transition-all"
                  >
                    Create Content <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
