'use client'

import { useState } from 'react'
import {
  Video,
  Eye,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Tag,
  FileText,
  X,
  TrendingUp,
  Clock,
  Info,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { DEMO_VIDEOS } from '@/lib/demo-mode'
import { formatDate, formatNumber, formatDuration } from '@/lib/utils'

// ─── SEO result type ─────────────────────────────────────────────────────────
interface SEOResult {
  titles: string[]
  tags: string[]
  description: string
}

export default function VideoManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [seoModal, setSeoModal] = useState<typeof DEMO_VIDEOS[0] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null)
  const [activeTab, setActiveTab] = useState<'titles' | 'tags' | 'description'>('titles')

  const filteredVideos = DEMO_VIDEOS.filter((v) =>
    !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOptimize = (video: typeof DEMO_VIDEOS[0]) => {
    setSeoModal(video)
    setGenerating(true)
    setSeoResult(null)
    setActiveTab('titles')
    setTimeout(() => {
      setGenerating(false)
      setSeoResult({
        titles: [
          `${video.title} (Complete Guide ${new Date().getFullYear()})`,
          `How to Master ${video.title.split(' ').slice(0, 3).join(' ')} — Full Tutorial`,
          `${video.title.split(' ').slice(0, 3).join(' ')} for Beginners | Step-by-Step`,
          `${video.title} — Everything You Need to Know`,
        ],
        tags: ['programming', 'tutorial', 'webdev', 'javascript', 'nodejs', 'coding',
          video.title.toLowerCase().split(' ').slice(0, 3).join(''), 'developer', 'tech', '2024'],
        description: `In this comprehensive tutorial, I cover everything about ${video.title}.

Whether you're a beginner just starting out or an experienced developer looking to level up, this video has something for everyone.

🕐 TIMESTAMPS
0:00 - Introduction
2:30 - Core Concepts
8:00 - Live Demo
22:00 - Common Mistakes
28:00 - Q&A

📌 KEY TOPICS COVERED:
• Core fundamentals and theory
• Practical implementation walkthrough
• Real-world use cases and examples
• Best practices and performance tips

🔔 SUBSCRIBE for weekly tech tutorials!
👍 LIKE if you found this helpful!
💬 COMMENT your questions below!

#webdev #programming #tutorial #javascript`,
      })
    }, 2000)
  }

  const getThumbnailConcepts = (title: string) => [
    `Split-screen: Code on left, result on right — bold "${title.split(' ').slice(0, 3).join(' ')}" text`,
    `Dark theme terminal screenshot with glowing indigo title overlay`,
    `Face + code editor split with arrow pointing to key section, orange "COMPLETE GUIDE" stamp`,
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-300">Video library</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Make every published video work harder.</h1>
          <p className="text-sm text-slate-500 mt-1">Manage published videos and optimize them with AI SEO</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
            <Info className="w-3.5 h-3.5" /> Demo Data
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Published Videos', value: DEMO_VIDEOS.length.toString(), icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Views', value: formatNumber(DEMO_VIDEOS.reduce((s, v) => s + (v.viewCount ?? 0), 0)), icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Likes', value: formatNumber(DEMO_VIDEOS.reduce((s, v) => s + (v.likeCount ?? 0), 0)), icon: ThumbsUp, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#151b2e] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/10">
            <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search videos…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-[#151b2e] text-white shadow-sm"
        />
      </div>

      {/* Video list */}
      <div className="space-y-4">
        {filteredVideos.map((video) => {
          const engagementRate = video.viewCount
            ? (((video.likeCount ?? 0) + (video.commentCount ?? 0)) / video.viewCount * 100).toFixed(1)
            : '0'
          return (
            <div key={video.id} className="bg-[#151b2e] border border-white/8 rounded-2xl overflow-hidden shadow-xl shadow-black/10 hover:border-violet-400/40 transition-all group">
              <div className="flex gap-0">
                {/* Thumbnail */}
                <div className="w-40 md:w-56 shrink-0 relative overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    style={{ minHeight: '100px' }}
                  />
                  {video.duration && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 min-w-0">
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2">{video.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(video.publishedAt)}</span>
                    <span className="badge bg-green-100 text-green-700">{video.privacyStatus}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Eye, value: formatNumber(video.viewCount ?? 0), label: 'views' },
                      { icon: ThumbsUp, value: formatNumber(video.likeCount ?? 0), label: 'likes' },
                      { icon: MessageSquare, value: formatNumber(video.commentCount ?? 0), label: 'comments' },
                      { icon: TrendingUp, value: `${engagementRate}%`, label: 'engagement' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-1 text-xs text-slate-500">
                        <stat.icon className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700">{stat.value}</span>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleOptimize(video)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI SEO Optimizer
                    </button>
                    <button onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank', 'noopener,noreferrer')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* SEO Modal */}
      {seoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSeoModal(null)}>
          <div className="bg-[#151b2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">AI SEO Optimizer</h2>
                  <p className="text-xs text-slate-400 truncate max-w-sm">{seoModal.title}</p>
                </div>
              </div>
              <button onClick={() => setSeoModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {generating ? (
              <div className="flex flex-col items-center justify-center h-52 gap-3">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Optimizing for search rankings…</p>
              </div>
            ) : seoResult ? (
              <>
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  {([
                    { key: 'titles' as const, label: 'Title Suggestions', icon: FileText },
                    { key: 'tags' as const, label: 'Tags', icon: Tag },
                    { key: 'description' as const, label: 'Description', icon: FileText },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                        activeTab === key
                          ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  {activeTab === 'titles' && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 mb-3">AI-generated SEO-optimized title alternatives:</p>
                      {seoResult.titles.map((title, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/20 group transition-all">
                          <span className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</span>
                          <p className="text-sm text-slate-700 flex-1">{title}</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(title)}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                      {/* Thumbnail concepts */}
                      <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                        <h4 className="text-xs font-semibold text-violet-700 mb-2">🖼 A/B Thumbnail Concepts</h4>
                        <div className="space-y-1.5">
                          {getThumbnailConcepts(seoModal.title).map((concept, i) => (
                            <p key={i} className="text-xs text-violet-600">{i + 1}. {concept}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'tags' && (
                    <div>
                      <p className="text-xs text-slate-500 mb-3">Optimized YouTube tags for discoverability:</p>
                      <div className="flex flex-wrap gap-2">
                        {seoResult.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200"
                          >
                            <Tag className="w-2.5 h-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(seoResult.tags.join(', '))}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copy All Tags
                      </button>
                    </div>
                  )}
                  {activeTab === 'description' && (
                    <div>
                      <p className="text-xs text-slate-500 mb-3">Optimized YouTube description with timestamps and CTAs:</p>
                      <textarea
                        className="w-full h-64 px-3 py-2.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none resize-none font-mono"
                        value={seoResult.description}
                        readOnly
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(seoResult.description)}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copy Description
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            <div className="p-5 border-t border-slate-100">
              <button onClick={() => setSeoModal(null)} className="w-full px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
