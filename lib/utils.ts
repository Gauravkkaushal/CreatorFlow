import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const diffInSec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diffInSec < 60 && diffInSec >= 0) return 'just now'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    const val = (n / 1_000_000).toFixed(1)
    return `${val.endsWith('.0') ? val.slice(0, -2) : val}M`
  }
  if (n >= 1_000) {
    const val = (n / 1_000).toFixed(1)
    return `${val.endsWith('.0') ? val.slice(0, -2) : val}K`
  }
  return n.toString()
}

export function formatDuration(iso: string): string {
  // Parse ISO 8601 duration PT32M15S → "32:15"
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return iso
  const h = parseInt(match[1] ?? '0')
  const m = parseInt(match[2] ?? '0')
  const s = parseInt(match[3] ?? '0')
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Content status helpers
export type ContentStatus = 'idea' | 'draft' | 'approved' | 'scheduled' | 'published'

export const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string; bgColor: string }> = {
  idea: { label: 'Idea', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  draft: { label: 'Draft', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  scheduled: { label: 'Scheduled', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  published: { label: 'Published', color: 'text-violet-700', bgColor: 'bg-violet-100' },
}

export const VALID_STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  idea: ['draft', 'approved'],
  draft: ['approved', 'idea'],
  approved: ['scheduled', 'draft'],
  scheduled: ['published', 'approved'],
  published: [],
}

export function canTransitionTo(from: ContentStatus, to: ContentStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to)
}
