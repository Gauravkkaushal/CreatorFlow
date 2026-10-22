'use client'

import { useState } from 'react'
import { DashboardSidebar, DashboardTopNav } from '@/components/layout/sidebar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`creator-workspace h-screen overflow-hidden bg-[#0f0f0f] text-slate-100 ${collapsed ? 'creator-sidebar-collapsed' : ''}`}>
      <div className="flex h-full">
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
