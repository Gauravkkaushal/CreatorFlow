'use client'

import { useState } from 'react'
import { ParticleDrift } from '@/components/ui/particle-drift'
import { DashboardSidebar, DashboardTopNav } from '@/components/layout/sidebar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`creator-workspace relative isolate h-screen overflow-hidden bg-[#0b1020] text-slate-100 ${collapsed ? 'creator-sidebar-collapsed' : ''}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="creator-orb creator-orb-primary" />
        <div className="creator-orb creator-orb-secondary" />
        <ParticleDrift density={150} className="absolute inset-0 h-full w-full opacity-100" />
      </div>
      <div className="relative z-10 flex h-full">
        <DashboardSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <div className="dashboard-shell-content flex min-w-0 flex-1 flex-col md:ml-64">
          <DashboardTopNav />
          <main className="creator-main flex-1 overflow-y-auto p-5 md:p-8">
            <div className="creator-page-enter">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
