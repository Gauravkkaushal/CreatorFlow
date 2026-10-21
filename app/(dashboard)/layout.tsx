import { DashboardSidebar, DashboardTopNav } from '@/components/layout/sidebar'
import { ParticleDrift } from '@/components/ui/particle-drift'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | CreatorFlow AI',
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="creator-workspace relative isolate h-screen overflow-hidden bg-[#0b1020] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="creator-orb creator-orb-primary" />
        <div className="creator-orb creator-orb-secondary" />
        <ParticleDrift density={150} className="absolute inset-0 h-full w-full opacity-100" />
      </div>
      <div className="relative z-10 flex h-full">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col md:ml-64">
          <DashboardTopNav />
          <main className="creator-main flex-1 overflow-y-auto p-5 md:p-8">
            <div className="creator-page-enter">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
