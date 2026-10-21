import { DashboardShell } from '@/components/layout/dashboard-shell'
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
  return <DashboardShell>{children}</DashboardShell>
}
