'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Compass,
  Lightbulb,
  LogOut,
  Menu,
  Plug,
  Radio,
  Settings,
  Sparkles,
  User,
  UsersRound,
  Video,
  Zap,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { DEMO_CHANNEL } from '@/lib/demo-mode'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Compass },
  { href: '/audience', label: 'Audience', icon: UsersRound },
  { href: '/content-planner', label: 'Ideas & Projects', icon: Lightbulb },
  { href: '/calendar', label: 'Publishing Calendar', icon: CalendarDays },
  { href: '/stream-studio', label: 'Live Studio', icon: Radio },
  { href: '/video-management', label: 'Video Library', icon: Video },
]

export function DashboardSidebar({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const pathname = usePathname()

  return (
    <aside className={cn('fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-[#0f0f0f] transition-all duration-300 md:flex', collapsed ? 'w-[76px]' : 'w-64')}>
      <div className="flex h-20 items-center border-b border-white/8 px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-950/50"><Zap className="h-4 w-4 text-white" /></div>
          {!collapsed && <span className="truncate font-[Outfit] text-base font-bold tracking-tight text-white">CreatorFlow</span>}
        </Link>
        {!collapsed && <button onClick={() => onCollapsedChange(true)} className="ml-auto rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Collapse sidebar"><ChevronLeft className="h-4 w-4" /></button>}
      </div>
      {collapsed && <button onClick={() => onCollapsedChange(false)} className="absolute -right-3 top-6 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-[#212121] text-slate-300 shadow-lg shadow-black/30 transition hover:bg-red-600 hover:text-white" aria-label="Expand sidebar"><ChevronRight className="h-4 w-4" /></button>}

      {!collapsed && <div className="mx-3 mt-5 rounded-xl border border-white/8 bg-white/[0.035] p-3"><div className="flex items-center gap-2"><span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-300"><Clapperboard className="h-4 w-4" /><i className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-[#0b1020] bg-emerald-400" /></span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-100">{DEMO_CHANNEL.channelTitle}</p><p className="mt-0.5 text-[11px] text-slate-500">Connected to YouTube</p></div></div></div>}

      <nav className="flex-1 space-y-1 px-3 py-6">
        {!collapsed && <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Workspace</p>}
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} className={cn('group flex items-center rounded-xl py-2.5 text-sm transition', collapsed ? 'justify-center px-2' : 'gap-3 px-3', active ? 'bg-red-600/15 font-semibold text-white shadow-sm shadow-black/10' : 'font-medium text-slate-400 hover:bg-white/[0.055] hover:text-slate-100')}><item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-red-400')} />{!collapsed && item.label}</Link>
        })}
      </nav>

      <div className="border-t border-white/8 p-3">
        {!collapsed && <Link href="/integrations" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.055] hover:text-white"><Plug className="h-[18px] w-[18px]" /> Channel connection</Link>}
        <Link href="/settings" title={collapsed ? 'Settings' : undefined} className={cn('mb-1 flex items-center rounded-xl py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.055] hover:text-white', collapsed ? 'justify-center px-2' : 'gap-3 px-3')}><Settings className="h-[18px] w-[18px]" />{!collapsed && 'Settings'}</Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} title={collapsed ? 'Sign out' : undefined} className={cn('flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-300', collapsed ? 'justify-center px-2' : 'gap-3 px-3')}><LogOut className="h-[18px] w-[18px]" />{!collapsed && 'Sign out'}</button>
      </div>
    </aside>
  )
}

export function DashboardTopNav() {
  const { data: session } = useSession()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  return (
    <header className="relative flex h-20 items-center justify-between border-b border-white/10 bg-[#0f0f0f] px-5 md:px-8">
      <button onClick={() => setShowMobileMenu((value) => !value)} className="rounded-lg p-2 text-slate-400 md:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="hidden items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 md:flex"><Sparkles className="h-3.5 w-3.5 text-red-400" /><span className="text-xs text-slate-400">Make content your audience already wants.</span></div>
      <div className="ml-auto flex items-center gap-3">
        <button onClick={() => setShowNotifications((value) => !value)} className="relative rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-400" /></button>
        <Link href="/settings" className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] p-1.5 pr-3 transition hover:bg-white/[0.07]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white">{session?.user?.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}</span><span className="hidden max-w-28 truncate text-xs font-medium text-slate-300 lg:block">{session?.user?.name ?? 'Your profile'}</span></Link>
      </div>
      {showMobileMenu && <nav className="absolute left-4 top-[4.5rem] z-50 w-60 rounded-xl border border-white/10 bg-[#10162a] p-2 shadow-2xl md:hidden">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"><item.icon className="h-4 w-4" />{item.label}</Link>)}</nav>}
      {showNotifications && <div className="absolute right-5 top-[4.5rem] z-50 w-80 rounded-xl border border-white/10 bg-[#10162a] p-4 shadow-2xl"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-white">Notifications</p><button onClick={() => setShowNotifications(false)} className="text-xs text-violet-300 hover:text-white">Dismiss</button></div><p className="mt-3 rounded-lg bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">Your audience analysis is ready. There are 5 new questions worth turning into videos.</p><Link href="/audience" onClick={() => setShowNotifications(false)} className="mt-3 inline-flex text-xs font-semibold text-violet-300 hover:text-white">Review insights →</Link></div>}
    </header>
  )
}
