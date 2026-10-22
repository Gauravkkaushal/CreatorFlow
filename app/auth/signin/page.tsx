'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Zap, Sparkles, ShieldCheck, Play, ArrowRight } from 'lucide-react'
import { Youtube } from '@/components/icons/youtube'
import { isClientDemoMode } from '@/lib/demo-mode'

export default function SignInPage() {
  const demoAvailable = isClientDemoMode()

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-[#212121] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-3 shadow-md shadow-red-950/50">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-[Outfit]">CreatorFlow</h1>
          <p className="text-sm text-slate-400 mt-1">Your YouTube creator workspace</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-red-950/50"
          >
            <Youtube className="w-5 h-5" />
            Continue with Google & YouTube
          </button>

          {demoAvailable && (
            <>
              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#212121] px-3 text-xs font-medium uppercase tracking-wider text-slate-500">or</span>
              </div>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#181818] hover:bg-[#2b2b2b] text-slate-100 font-medium text-sm rounded-xl border border-white/10 transition-all"
              >
                <Play className="w-4 h-4 text-red-400" />
                Explore demo workspace
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
              </Link>
            </>
          )}

        </div>

        {/* Security & Feature Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Only requests read-only channel and comment permissions</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-red-400 shrink-0" />
            <span>AI audience analysis & content planning included</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-200 transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
