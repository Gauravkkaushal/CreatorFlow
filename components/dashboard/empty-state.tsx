import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  cta?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/12 bg-[#151b2e] px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-white">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {href && cta && (
        <Link href={href} className="mt-5 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400">
          {cta}
        </Link>
      )}
    </div>
  )
}
