'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
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
  BarChart3,
  Users,
  MousePointerClick,
  Gauge,
  ExternalLink,
} from 'lucide-react'
import { DEMO_VIDEOS, isClientDemoMode } from '@/lib/demo-mode'
import { EmptyState } from '@/components/dashboard/empty-state'
import type { YouTubeVideo } from '@/types'
import { formatDate, formatNumber, formatDuration } from '@/lib/utils'

// ─── SEO result type ─────────────────────────────────────────────────────────
interface SEOResult {
  titles: string[]
  tags: string[]
  description: string
}

type VideoItem = YouTubeVideo

const isDemo = isClientDemoMode()

async function fetchVideos(): Promise<VideoItem[]> {
  const res = await fetch('/api/videos')
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Failed to load videos')
  return json.data
}
type AnalyticsTab = 'overview' | 'reach' | 'engagement' | 'audience'

const ANALYTICS_TABS: { key: AnalyticsTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'reach', label: 'Reach' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'audience', label: 'Audience' },
]

function getVideoAnalytics(video: VideoItem) {
  const views = video.viewCount ?? 0
  const likes = video.likeCount ?? 0
  const comments = video.commentCount ?? 0
  const videoIndex = DEMO_VIDEOS.findIndex((item) => item.id === video.id) + 1
  const averageViewDuration = 8 * 60 + videoIndex * 71
  const watchHours = Math.round((views * averageViewDuration) / 3600)
  const impressions = Math.round(views * (18.4 + videoIndex * 0.8))
  const ctr = 4.8 + videoIndex * 0.4
  const retention = 38 + videoIndex * 3
  const returning = Math.round(views * (0.31 + videoIndex * 0.02))
  const uniqueViewers = Math.round(views * 0.72)
  const subscribers = Math.round(views * (0.008 + videoIndex * 0.001))
  const points = [12, 25, 38, 48, 56, 62, 69, 75, 81, 86, 92, 97].map((base, index) =>
    Math.round((views / 100) * (base / 10) * (index === 0 ? 0.74 : 1))
  )

  return { views, likes, comments, averageViewDuration, watchHours, impressions, ctr, retention, returning, uniqueViewers, subscribers, points }
}

function formatWatchDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function AnalyticsChart({ points, color = '#ff0033' }: { points: number[]; color?: string }) {
  const max = Math.max(...points, 1)
  const path = points.map((point, index) => {
    const x = 4 + (index / (points.length - 1)) * 92
    const y = 91 - (point / max) * 76
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className="mt-3 h-28 w-full rounded-lg border border-white/8 bg-[#101010] p-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-label="Video performance chart" role="img">
        {[20, 45, 70, 95].map((y) => <line key={y} x1="4" x2="96" y1={y} y2={y} stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />)}
        <path d={`${path} L 96 96 L 4 96 Z`} fill={color} opacity="0.12" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>Published</span><span>Last 7 days</span><span>Today</span></div>
    </div>
  )
}

export default function VideoManagementPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [seoModal, setSeoModal] = useState<VideoItem | null>(null)
  const [generating, setGenerating] = useState(false)
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null)
  const [activeTab, setActiveTab] = useState<'titles' | 'tags' | 'description'>('titles')
  const [analyticsModal, setAnalyticsModal] = useState<VideoItem | null>(null)
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('overview')

  const { data: videos = [], isLoading, error } = useQuery({ queryKey: ['videos'], queryFn: fetchVideos })

  useEffect(() => setIsMounted(true), [])

  const filteredVideos = videos.filter((v) =>
    !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOptimize = (video: VideoItem) => {
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

  const openAnalytics = (video: VideoItem) => {
    setAnalyticsModal(video)
    setAnalyticsTab('overview')
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
          {isDemo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
              <Info className="w-3.5 h-3.5" /> Demo Data
            </span>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Published Videos', value: videos.length.toString(), icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Views', value: formatNumber(videos.reduce((s, v) => s + (v.viewCount ?? 0), 0)), icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Likes', value: formatNumber(videos.reduce((s, v) => s + (v.likeCount ?? 0), 0)), icon: ThumbsUp, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#151b2e] px-4 py-3 shadow-lg shadow-black/10">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold leading-5 text-white">{stat.value}</div>
              <div className="mt-0.5 truncate text-[11px] text-slate-500">{stat.label}</div>
            </div>
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
      {isLoading && (
        <div role="status" className="flex items-center justify-center gap-3 rounded-2xl border border-white/8 bg-[#151b2e] py-12 text-sm text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-violet-400" /> Loading your videos…
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error.message} {error.message.includes('sign in') && <a href="/auth/signin" className="font-semibold underline">Sign in</a>}
        </div>
      )}
      {!isLoading && !error && videos.length === 0 && (
        <EmptyState icon={Video} title="No videos yet" description="Videos you upload to your YouTube channel will show up here." />
      )}
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
                    {/* Analytics are simulated; real numbers need the YouTube Analytics API */}
                    {isDemo && <button onClick={() => openAnalytics(video)} className="px-3 py-1.5 bg-white/8 hover:bg-white/12 border border-white/10 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" /> Analytics
                    </button>}
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

      {/* YouTube Studio-style video analytics */}
      {isMounted && analyticsModal && createPortal((() => {
        const data = getVideoAnalytics(analyticsModal)
        const engagement = data.views ? ((data.likes + data.comments) / data.views * 100).toFixed(1) : '0.0'
        const tabContent: Record<AnalyticsTab, { eyebrow: string; heading: string; description: string; metrics: { label: string; value: string; change?: string; icon: typeof Eye }[]; chartLabel: string }> = {
          overview: {
            eyebrow: 'Since published', heading: `${formatNumber(data.views)} views`, description: 'Performance compared with your typical videos.', chartLabel: 'Views',
            metrics: [
              { label: 'Views', value: formatNumber(data.views), change: '+18% vs usual', icon: Eye },
              { label: 'Watch time', value: `${formatNumber(data.watchHours)} hours`, change: '+12% vs usual', icon: Clock },
              { label: 'Subscribers', value: `+${data.subscribers}`, change: '+4 vs usual', icon: Users },
            ],
          },
          reach: {
            eyebrow: 'How viewers find this video', heading: `${formatNumber(data.impressions)} impressions`, description: 'Thumbnail impressions and click-through performance.', chartLabel: 'Impressions',
            metrics: [
              { label: 'Impressions', value: formatNumber(data.impressions), change: '+21% vs usual', icon: Eye },
              { label: 'Impressions click-through rate', value: `${data.ctr.toFixed(1)}%`, change: '+0.6% vs usual', icon: MousePointerClick },
              { label: 'Views from impressions', value: formatNumber(Math.round(data.impressions * data.ctr / 100)), icon: TrendingUp },
            ],
          },
          engagement: {
            eyebrow: 'How viewers engage', heading: `${formatWatchDuration(data.averageViewDuration)} average view duration`, description: 'Watch time and audience retention for this video.', chartLabel: 'Audience retention',
            metrics: [
              { label: 'Watch time', value: `${formatNumber(data.watchHours)} hours`, change: '+12% vs usual', icon: Clock },
              { label: 'Average view duration', value: formatWatchDuration(data.averageViewDuration), change: '+0:42 vs usual', icon: Gauge },
              { label: 'Likes & comments', value: `${engagement}%`, change: 'Engagement rate', icon: ThumbsUp },
            ],
          },
          audience: {
            eyebrow: 'Who is watching', heading: `${formatNumber(data.uniqueViewers)} unique viewers`, description: 'Your audience activity for this individual video.', chartLabel: 'Unique viewers',
            metrics: [
              { label: 'Unique viewers', value: formatNumber(data.uniqueViewers), change: '+16% vs usual', icon: Users },
              { label: 'Returning viewers', value: formatNumber(data.returning), change: '+9% vs usual', icon: TrendingUp },
              { label: 'New subscribers', value: `+${data.subscribers}`, change: 'From this video', icon: Users },
            ],
          },
        }
        const activeAnalytics = tabContent[analyticsTab]
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && setAnalyticsModal(null)}>
              <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/70 animate-slide-up">
                <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-3.5 sm:px-6">
                  <div className="flex min-w-0 gap-3">
                    <img src={analyticsModal.thumbnailUrl} alt="" className="h-11 w-20 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#ff6b82]">Video analytics</p>
                      <h2 className="mt-0.5 truncate text-base font-semibold text-white sm:text-lg">{analyticsModal.title}</h2>
                    </div>
                  </div>
                  <button onClick={() => setAnalyticsModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/8 hover:text-white" aria-label="Close analytics"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex gap-5 overflow-x-auto border-b border-white/8 px-5 sm:px-6">
                  {ANALYTICS_TABS.map((tab) => <button key={tab.key} onClick={() => setAnalyticsTab(tab.key)} className={`shrink-0 border-b-2 py-2.5 text-sm font-medium transition-colors ${analyticsTab === tab.key ? 'border-[#ff0033] text-white' : 'border-transparent text-slate-500 hover:text-slate-200'}`}>{tab.label}</button>)}
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{activeAnalytics.eyebrow}</p>
                  <div className="mt-1 flex items-end justify-between gap-4"><h3 className="text-xl font-bold text-white sm:text-2xl">{activeAnalytics.heading}</h3><p className="hidden text-right text-xs text-slate-400 sm:block">{activeAnalytics.description}</p></div>

                  <div className="mt-4 grid divide-y divide-white/8 overflow-hidden rounded-xl border border-white/8 bg-[#101010] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {activeAnalytics.metrics.map((metric) => <div key={metric.label} className="p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500"><metric.icon className="h-3.5 w-3.5" />{metric.label}</div>
                      <p className="mt-1 text-lg font-semibold text-white">{metric.value}</p>
                      {metric.change && <p className="text-[11px] text-emerald-400">{metric.change}</p>}
                    </div>)}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr_0.9fr]">
                  <div className="rounded-xl border border-white/8 bg-[#171717] p-4">
                    <div className="flex items-center justify-between"><div><h4 className="text-sm font-semibold text-white">{activeAnalytics.chartLabel}</h4><p className="mt-0.5 text-xs text-slate-500">Since this video was published</p></div><span className="rounded-full bg-[#ff0033]/10 px-2.5 py-1 text-[11px] font-medium text-[#ff6b82]">Demo data</span></div>
                    <AnalyticsChart points={data.points.map((point, index) => analyticsTab === 'engagement' ? Math.max(20, 100 - index * (5 + DEMO_VIDEOS.findIndex((item) => item.id === analyticsModal.id))) : point)} />
                  </div>
                    <div className="rounded-xl border border-white/8 bg-[#171717] p-4"><h4 className="text-sm font-semibold text-white">Quick snapshot</h4><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><p className="text-slate-500">Likes</p><p className="mt-0.5 font-semibold text-white">{formatNumber(data.likes)}</p></div><div><p className="text-slate-500">Comments</p><p className="mt-0.5 font-semibold text-white">{formatNumber(data.comments)}</p></div><div><p className="text-slate-500">Retention</p><p className="mt-0.5 font-semibold text-white">{data.retention}%</p></div><div><p className="text-slate-500">Published</p><p className="mt-0.5 font-semibold text-white">{formatDate(analyticsModal.publishedAt)}</p></div></div><button onClick={() => { setAnalyticsModal(null); handleOptimize(analyticsModal) }} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#ff6b82] hover:text-white"><Sparkles className="h-3.5 w-3.5" />Improve with SEO <ExternalLink className="h-3 w-3" /></button></div>
                  </div>
                </div>
              </div>
          </div>
        )
      })(), document.body)}

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
