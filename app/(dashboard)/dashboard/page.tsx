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
import { DEMO_BROADCASTS, DEMO_CONTENT_IDEAS, DEMO_TOPICS } from '@/lib/demo-mode'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Home' }

const stages = [
  { label: 'Ideas', count: 3, color: 'bg-violet-400' },
  { label: 'Writing', count: 2, color: 'bg-sky-400' },
  { label: 'Producing', count: 1, color: 'bg-amber-400' },
  { label: 'Scheduled', count: 1, color: 'bg-emerald-400' },
]

export default function DashboardPage() {
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
        <Link href="/content-planner" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-400">
          <WandSparkles className="h-4 w-4" /> Create a video
        </Link>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-950 p-6 shadow-2xl shadow-indigo-950/40 md:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
              <Sparkles className="h-3.5 w-3.5" /> Strongest audience opportunity
            </div>
            <h2 className="mt-5 max-w-xl text-2xl font-bold tracking-tight text-white md:text-3xl">Your viewers want a video about {opportunity.name}.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/80">{opportunity.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1.5 font-medium text-white">{opportunity.commentCount} viewer requests</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 font-medium text-white">Demand score {opportunity.priorityScore}/100</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/content-planner?topic=${encodeURIComponent(opportunity.name)}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50">
                Turn into a video <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/audience" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                See all feedback
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">What viewers are saying</p>
            <blockquote className="mt-4 text-base leading-7 text-white">“{opportunity.representativeComments[0]}”</blockquote>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-xs text-indigo-200">Most asked question</p>
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
