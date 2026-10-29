import { Suspense } from 'react'
import Link from 'next/link'

const MESSAGES: Record<string, string> = {
  Configuration: 'Sign-in is misconfigured on the server. Check the Google OAuth credentials in .env.',
  AccessDenied: 'Access was denied. Make sure you approved the requested Google permissions.',
  Verification: 'The sign-in link is no longer valid. Please try again.',
}

type SearchParams = Promise<{ error?: string }>

async function ErrorDetails({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams
  const message = (error && MESSAGES[error]) || 'Something went wrong while signing in. Please try again.'
  return (
    <>
      <p className="text-sm text-slate-400 mt-2">{message}</p>
      {error && <p className="text-xs text-slate-600 mt-2">Error code: {error}</p>}
    </>
  )
}

export default function AuthErrorPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-[#212121] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40 text-center">
        <h1 className="text-xl font-bold text-white">Sign-in failed</h1>
        {/* searchParams is request data, so it streams inside Suspense (Next 16 prerendering) */}
        <Suspense fallback={<p className="text-sm text-slate-400 mt-2">Loading details…</p>}>
          <ErrorDetails searchParams={searchParams} />
        </Suspense>
        <Link
          href="/auth/signin"
          className="inline-block mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-all"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
