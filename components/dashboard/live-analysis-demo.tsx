'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, LoaderCircle, MessageSquareText, Sparkles } from 'lucide-react'

const steps = [
  'Syncing the latest comments from DevFold Studio',
  'Finding repeated questions and viewer pain points',
  'Ranking opportunities by demand and engagement',
]

export function LiveAnalysisDemo() {
  const [running, setRunning] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!running) return
    const timers = steps.map((_, index) => window.setTimeout(() => setCompletedSteps(index + 1), (index + 1) * 850))
    const finish = window.setTimeout(() => { setRunning(false); setComplete(true) }, 2900)
    return () => { timers.forEach(window.clearTimeout); window.clearTimeout(finish) }
  }, [running])

  const start = () => {
    setComplete(false)
    setCompletedSteps(0)
    setRunning(true)
  }

  if (complete) {
    return <div className="flex flex-wrap items-center gap-3"><div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200"><CheckCircle2 className="h-4 w-4" /> Analysis ready: 12 opportunities found</div><Link href="/audience" className="text-sm font-semibold text-violet-300 transition hover:text-white">View results →</Link><button onClick={start} className="text-xs font-medium text-slate-400 transition hover:text-white">Run again</button></div>
  }

  return <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"><button onClick={start} disabled={running} className="group inline-flex min-w-[205px] items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/25 transition hover:bg-violet-400 disabled:cursor-wait disabled:bg-violet-500/80"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15"><Sparkles className={`h-4 w-4 ${running ? 'animate-pulse' : ''}`} /></span>{running ? 'Analyzing comments…' : 'Analyze latest comments'}</button>{running && <div className="rounded-xl border border-white/10 bg-[#151b2e]/90 px-4 py-3 shadow-xl shadow-black/20"><div className="flex items-center gap-2 text-xs font-semibold text-slate-200"><LoaderCircle className="h-3.5 w-3.5 animate-spin text-violet-300" /> AI analysis in progress</div><div className="mt-2 space-y-1.5">{steps.map((step, index) => <p key={step} className={`flex items-center gap-2 text-[11px] transition ${index < completedSteps ? 'text-emerald-300' : index === completedSteps ? 'text-slate-200' : 'text-slate-500'}`}>{index < completedSteps ? <CheckCircle2 className="h-3 w-3" /> : <MessageSquareText className="h-3 w-3" />}{step}</p>)}</div></div>}</div>
}
