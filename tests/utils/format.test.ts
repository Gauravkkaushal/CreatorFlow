/**
 * Tests for lib/utils.ts utility helpers.
 *
 * Run with: npx jest tests/utils/format.test.ts
 * (or integrate into your test runner of choice)
 */

import { formatNumber, formatRelativeTime, cn, getInitials } from '@/lib/utils'

// ─── formatNumber ─────────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats numbers below 1 000 as-is', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
  })

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1_000)).toBe('1K')
    expect(formatNumber(1_500)).toBe('1.5K')
    expect(formatNumber(999_499)).toBe('999.5K')
  })

  it('formats numbers near the K/M boundary correctly', () => {
    // 999_999 rounds to 1000.0K which should escalate to 1M
    expect(formatNumber(999_999)).toBe('1M')
    expect(formatNumber(1_000_000)).toBe('1M')
  })

  it('formats millions with M suffix', () => {
    expect(formatNumber(1_000_000)).toBe('1M')
    expect(formatNumber(2_500_000)).toBe('2.5M')
  })

  it('handles negative numbers gracefully', () => {
    const result = formatNumber(-500)
    expect(typeof result).toBe('string')
  })
})

// ─── formatRelativeTime ───────────────────────────────────────────────────────

describe('formatRelativeTime', () => {
  const now = Date.now()

  it('returns "just now" for very recent timestamps', () => {
    const recent = new Date(now - 30_000).toISOString() // 30 seconds ago
    expect(formatRelativeTime(recent)).toMatch(/just now|s ago/i)
  })

  it('returns minutes for timestamps < 1 hour ago', () => {
    const fiveMinAgo = new Date(now - 5 * 60_000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toMatch(/min/i)
  })

  it('returns hours for timestamps < 24 hours ago', () => {
    const threeHoursAgo = new Date(now - 3 * 3_600_000).toISOString()
    expect(formatRelativeTime(threeHoursAgo)).toMatch(/h ago|hour/i)
  })

  it('returns days for older timestamps', () => {
    const twoDaysAgo = new Date(now - 2 * 86_400_000).toISOString()
    expect(formatRelativeTime(twoDaysAgo)).toMatch(/d ago|day/i)
  })

  it('accepts a Date object as input', () => {
    const date = new Date(now - 60_000)
    expect(typeof formatRelativeTime(date)).toBe('string')
  })
})

// ─── cn (class merge) ─────────────────────────────────────────────────────────

describe('cn', () => {
  it('merges class names without duplicates', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('resolves Tailwind conflicts by keeping the last one', () => {
    // tailwind-merge should keep the latter padding
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('handles conditional class names', () => {
    const active = true
    const result = cn('base', active && 'active', !active && 'inactive')
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('inactive')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})

// ─── getInitials ──────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns initials for a full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns a single initial for a single-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns at most 2 characters', () => {
    expect(getInitials('John Michael Doe').length).toBeLessThanOrEqual(2)
  })

  it('returns "?" for an empty string', () => {
    expect(getInitials('')).toBe('?')
  })

  it('returns "?" for a whitespace-only string', () => {
    expect(getInitials('   ')).toBe('?')
  })

  it('uppercases the result', () => {
    expect(getInitials('alice bob')).toBe('AB')
  })
})
