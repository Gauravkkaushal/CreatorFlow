import { Suspense } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MessageCircle,
  Play,
  Radio,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { DEMO_BROADCASTS, DEMO_CONTENT_IDEAS, DEMO_TOPICS, isDemoMode } from '@/lib/demo-mode'
import { formatDate, formatNumber } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { getLatestAnalysis } from '@/lib/analysis'
import type { IAudienceTopic } from '@/models/AudienceAnalysis'
import { getMyChannel, getMyVideos } from '@/services/youtube'
import { LiveAnalysisDemo } from '@/components/dashboard/live-analysis-demo'
import { EmptyState } from '@/components/dashboard/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Home' }

const stages = [
  { label: 'Ideas', count: 3, color: 'bg-violet-400' },
  { label: 'Writing', count: 2, color: 'bg-sky-400' },
  { label: 'Producing', count: 1, color: 'bg-amber-400' },
  { label: 'Scheduled', count: 1, color: 'bg-emerald-400' },
]

export default function DashboardPage() {
  if (isDemoMode()) return <DemoHome />

  // auth() reads cookies, so the live view must stream inside Suspense (Next 16 prerendering)
  return (
    <Suspense
      fallback={
        <div role="status" className="mx-auto flex max-w-7xl items-center justify-center gap-3 py-24 text-sm text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-violet-400" /> Loading your channel…
        </div>
      }
    >
      <LiveHome />
    </Suspense>
  )
}

async function LiveHome() {
  const session = await auth()
  const token = session?.error ? undefined : session?.accessToken
  let loadError: string | null = token ? null : 'Your YouTube access has expired. Please sign in again.'
  const [channel, videos] = token
    ? await Promise.all([getMyChannel(token), getMyVideos(token, 4)]).catch((err) => {
        console.error('[dashboard] YouTube load failed', err)
        loadError = 'Could not load your YouTube data right now. Please refresh in a moment.'
        return [null, []] as const
      })
    : ([null, []] as const)

  const analysis = await getLatestAnalysis(session?.user?.id).catch((err) => {
    console.error('[dashboard] analysis load failed', err)
    return null
  })
  // Don't trust the model's sort order
  const opportunity = analysis?.topics.reduce<IAudienceTopic | undefined>(
    (best, t) => (!best || t.priorityScore > best.priorityScore ? t : best),
    undefined
  )

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      <header>
        <p className="text-sm font-medium text-violet-300">Creator home</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
          {channel ? `Welcome back, ${channel.channelTitle}.` : 'Your next great video starts here.'}
        </h1>
        <p className="mt-2 text-sm text-slate-400">Turn what your viewers are saying into videos they will actually watch.</p>
      </header>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {loadError} {!token && <a href="/auth/signin" className="font-semibold underline">Sign in</a>}
        </div>
      )}

      {channel && (
        <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#151b2e] p-6 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={channel.thumbnailUrl} alt="" className="h-16 w-16 rounded-full border border-white/10" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-white">{channel.channelTitle}</h2>
            <p className="mt-1 line-clamp-1 text-sm text-slate-400">{channel.channelDescription || 'Your connected YouTube channel'}</p>
          </div>
          <div className="flex gap-6">
            <div><p className="text-2xl font-bold text-white">{formatNumber(channel.subscriberCount)}</p><p className="text-xs text-slate-400">Subscribers</p></div>
            <div><p className="text-2xl font-bold text-white">{formatNumber(channel.videoCount)}</p><p className="text-xs text-slate-400">Videos</p></div>
          </div>
        </section>
      )}

      {channel && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Latest uploads</h2>
              <p className="mt-1 text-xs text-slate-400">How your newest videos are doing.</p>
            </div>
            <Link href="/video-management" className="text-xs font-semibold text-violet-300 hover:text-white">All videos</Link>
          </div>
          {videos.length === 0 ? (
            <EmptyState icon={Play} title="No videos yet" description="Upload your first video to YouTube and it will show up here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {videos.map((video) => (
                <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-2xl border border-white/8 bg-[#151b2e] transition hover:border-violet-400/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{video.title}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      {formatNumber(video.viewCount ?? 0)} views · {formatNumber(video.likeCount ?? 0)} likes · {formatNumber(video.commentCount ?? 0)} comments
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {opportunity && (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#151b2e] p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
            <Sparkles className="h-3.5 w-3.5" /> Best opportunity from your comments
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{opportunity.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{opportunity.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 font-medium text-slate-200">{opportunity.commentCount} viewer mentions</span>
                <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 font-medium text-emerald-200">Demand score {opportunity.priorityScore}/100</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/content-planner?topic=${encodeURIComponent(opportunity.name)}`} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400">
                  <WandSparkles className="h-4 w-4" /> Create this video <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/audience" className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]">
                  See all feedback
                </Link>
              </div>
            </div>
            {(opportunity.representativeComments[0] || opportunity.commonQuestions[0]) && (
              <div className="rounded-2xl border border-white/10 bg-black/15 p-5">
                {opportunity.representativeComments[0] && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">Viewer signal</p>
                    <blockquote className="mt-3 text-base leading-7 text-white">“{opportunity.representativeComments[0]}”</blockquote>
                  </>
                )}
                {opportunity.commonQuestions[0] && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-xs text-slate-400">Most asked question</p>
                    <p className="mt-1 text-sm font-medium text-white">{opportunity.commonQuestions[0]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {!opportunity && (
          <EmptyState icon={MessageCircle} title="No audience insights yet" description="Analyze your latest comments to find what your viewers keep asking for." href="/audience" cta="Analyze comments" />
        )}
        <EmptyState icon={WandSparkles} title="Plan your first video" description="Turn an idea into a title, outline and script with the AI planner." href="/content-planner" cta="Open content planner" />
      </div>
    </div>
  )
}

function DemoHome() {
  const opportunity = DEMO_TOPICS[0]
  const nextStream = DEMO_BROADCASTS[0]

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-300">Creator home</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">Your next great video starts here.</h1>
          <p className="mt-2 text-sm text-slate-400">Turn what your viewers are saying into videos they will actually watch.</p>
        </div>
        <LiveAnalysisDemo />
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#151b2e] p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> Best opportunity this week
            </div>
            <h2 className="mt-5 max-w-xl text-2xl font-bold tracking-tight text-white md:text-3xl">Make the video your viewers are already looking for.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{opportunity.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 font-medium text-slate-200">{opportunity.commentCount} viewer requests</span>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 font-medium text-emerald-200">Demand score {opportunity.priorityScore}/100</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/content-planner?topic=${encodeURIComponent(opportunity.name)}`} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400">
                <WandSparkles className="h-4 w-4" /> Create this video <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/audience" className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]">
                See all feedback
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">Viewer signal</p>
            <blockquote className="mt-4 text-base leading-7 text-white">“{opportunity.representativeComments[0]}”</blockquote>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400">Most asked question</p>
              <p className="mt-1 text-sm font-medium text-white">{opportunity.commonQuestions[0]}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/8 bg-[#151b2e] p-5 shadow-xl shadow-black/10 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Your content pipeline</p>
                <p className="mt-1 text-xs text-slate-400">Every idea has a clear next step.</p>
              </div>
              <Link href="/content-planner" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white">Open pipeline <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {stages.map((stage) => (
                <Link key={stage.label} href="/content-planner" className="rounded-xl border border-white/7 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
                  <div className={`h-1.5 w-10 rounded-full ${stage.color}`} />
                  <p className="mt-5 text-3xl font-bold text-white">{stage.count}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">{stage.label}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Continue creating</h2>
                <p className="mt-1 text-xs text-slate-400">Jump back into the work already in motion.</p>
              </div>
              <Link href="/content-planner" className="text-xs font-semibold text-violet-300 hover:text-white">View projects</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {DEMO_CONTENT_IDEAS.map((idea, index) => (
                <Link key={idea._id} href="/content-planner" className="group overflow-hidden rounded-2xl border border-white/8 bg-[#151b2e] transition hover:border-violet-400/40 hover:shadow-xl hover:shadow-violet-950/20">
                  <div className={`relative h-28 overflow-hidden ${index === 0 ? 'bg-gradient-to-br from-red-500 via-fuchsia-600 to-violet-900' : 'bg-gradient-to-br from-sky-500 via-indigo-700 to-violet-950'}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.3),transparent_25%)]" />
                    <span className="absolute left-4 top-4 rounded-md bg-black/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{idea.status}</span>
                    <Play className="absolute bottom-4 right-4 h-7 w-7 rounded-full border border-white/30 p-1.5 text-white" />
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{idea.title}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>{idea.keywords.slice(0, 2).join(' • ')}</span>
                      <span className="inline-flex items-center gap-1 text-violet-300 group-hover:text-white">Continue <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/8 bg-[#151b2e] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><CalendarDays className="h-4 w-4 text-violet-300" /> Your week</div>
            <div className="mt-5 space-y-4 border-l border-white/10 pl-4">
              <div className="relative"><i className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-violet-400" /><p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Today</p><p className="mt-1 text-sm text-slate-200">Review JWT video outline</p></div>
              <div className="relative"><i className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-sky-400" /><p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Wednesday</p><p className="mt-1 text-sm text-slate-200">Film React Server Components</p></div>
              <div className="relative"><i className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-red-400" /><p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Friday</p><p className="mt-1 text-sm text-slate-200">Live Q&amp;A at 6:00 PM</p></div>
            </div>
            <Link href="/calendar" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white">Open calendar <ChevronRight className="h-3.5 w-3.5" /></Link>
          </section>

          <section className="rounded-2xl border border-white/8 bg-[#151b2e] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Radio className="h-4 w-4 text-red-400" /> Next live stream</div>
            <p className="mt-4 text-sm font-medium leading-5 text-slate-100">{nextStream.title}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" /> {formatDate(nextStream.scheduledStartTime)}</p>
            <Link href="/stream-studio" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-red-400/50 hover:bg-red-400/10">Prepare stream <ArrowRight className="h-3.5 w-3.5" /></Link>
          </section>

          <Link href="/audience" className="block rounded-2xl border border-violet-400/15 bg-violet-500/10 p-5 transition hover:bg-violet-500/15">
            <MessageCircle className="h-5 w-5 text-violet-300" />
            <p className="mt-4 text-sm font-semibold text-white">11 new viewer questions</p>
            <p className="mt-1 text-xs leading-5 text-violet-200/70">Find the content gaps hidden in your latest comments.</p>
          </Link>
        </aside>
      </div>
    </div>
  )
}
