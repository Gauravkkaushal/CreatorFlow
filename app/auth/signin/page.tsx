'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Zap, Sparkles, ShieldCheck, Play, ArrowRight } from 'lucide-react'
import { Youtube } from '@/components/icons/youtube'
import { isClientDemoMode } from '@/lib/demo-mode'

export default function SignInPage() {
  const demoAvailable = isClientDemoMode()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-indigo-100/40">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-3 shadow-md shadow-indigo-200">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-[Outfit]">CreatorFlow AI</h1>
          <p className="text-sm text-slate-500 mt-1">From audience insights to action</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300"
          >
            <Youtube className="w-5 h-5" />
            Continue with Google & YouTube
          </button>

          {demoAvailable && (
            <>
              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
              </div>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-sm rounded-xl border border-slate-200 transition-all"
              >
                <Play className="w-4 h-4 text-violet-600" />
                Explore demo workspace
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
              </Link>
            </>
          )}

        </div>

        {/* Security & Feature Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Only requests read-only channel and comment permissions</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>AI audience analysis & content planning included</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
