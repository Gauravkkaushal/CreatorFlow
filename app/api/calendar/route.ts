import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo-mode'
import type { ApiResponse, CalendarEvent } from '@/types'

// ─── Validation schemas ───────────────────────────────────────────────────────

const CalendarEventTypeEnum = z.enum(['video', 'livestream', 'short'])
const CalendarEventStatusEnum = z.enum(['scheduled', 'completed', 'cancelled'])

const CreateCalendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO 8601 datetime string' }),
  type: CalendarEventTypeEnum,
  status: CalendarEventStatusEnum.default('scheduled'),
  description: z.string().max(2000).optional(),
  timezone: z.string().default('UTC'),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'color must be a hex colour').default('#6366f1'),
})

/** Allowlist for PUT updates — prevents mass assignment of sensitive fields. */
const UpdateCalendarEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  type: CalendarEventTypeEnum.optional(),
  status: CalendarEventStatusEnum.optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
  timezone: z.string().optional(),
})

// ─── In-memory demo store (resets on server restart) ─────────────────────────

let DEMO_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    _id: 'cal-1',
    userId: 'demo-user',
    title: 'JWT Auth Tutorial Upload',
    description: 'Publish the completed JWT authentication guide',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    timezone: 'America/New_York',
    type: 'video',
    status: 'scheduled',
    color: '#6366f1',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'cal-2',
    userId: 'demo-user',
    title: 'Live Q&A Session',
    description: 'Monthly live Q&A with the community',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
    timezone: 'America/New_York',
    type: 'livestream',
    status: 'scheduled',
    color: '#3b82f6',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ─── GET — list events ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // 0-indexed
    const year = searchParams.get('year')

    let events = DEMO_CALENDAR_EVENTS

    if (month !== null && year !== null) {
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)

      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 0 || monthNum > 11) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid month or year query parameters' },
          { status: 400 }
        )
      }

      events = events.filter((e) => {
        const d = new Date(e.startDate)
        return d.getMonth() === monthNum && d.getFullYear() === yearNum
      })
    }

    return NextResponse.json<ApiResponse<CalendarEvent[]>>({ success: true, data: events })
  } catch (err) {
    console.error('[GET /api/calendar]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST — create event ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = CreateCalendarEventSchema.safeParse(body)
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json<ApiResponse>({ success: false, error: errorMsg }, { status: 400 })
    }

    const { title, startDate, type, status, description, timezone, color } = parsed.data

    const newEvent: CalendarEvent = {
      _id: `cal-${Date.now()}`,
      userId: session.user.id ?? 'demo-user',
      title,
      description,
      startDate: new Date(startDate),
      timezone,
      type,
      status,
      color,
      isDemo: isDemoMode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    DEMO_CALENDAR_EVENTS.push(newEvent)

    return NextResponse.json<ApiResponse<CalendarEvent>>({ success: true, data: newEvent }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/calendar]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PUT — update event ───────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { _id, ...rest } = body as Record<string, unknown>

    if (!_id || typeof _id !== 'string') {
      return NextResponse.json<ApiResponse>({ success: false, error: '_id is required' }, { status: 400 })
    }

    // Validate and allowlist update fields — prevents mass assignment
    const parsed = UpdateCalendarEventSchema.safeParse(rest)
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json<ApiResponse>({ success: false, error: errorMsg }, { status: 400 })
    }

    const idx = DEMO_CALENDAR_EVENTS.findIndex((e) => e._id === _id)
    if (idx === -1) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Event not found' }, { status: 404 })
    }

    const safeUpdates = parsed.data
    const updatedFields: Partial<CalendarEvent> = { ...safeUpdates }
    if (safeUpdates.startDate) {
      updatedFields.startDate = new Date(safeUpdates.startDate)
    }

    DEMO_CALENDAR_EVENTS[idx] = {
      ...DEMO_CALENDAR_EVENTS[idx],
      ...updatedFields,
      updatedAt: new Date(),
    }

    return NextResponse.json<ApiResponse<CalendarEvent>>({ success: true, data: DEMO_CALENDAR_EVENTS[idx] })
  } catch (err) {
    console.error('[PUT /api/calendar]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE — remove event ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'id is required' }, { status: 400 })
    }

    const before = DEMO_CALENDAR_EVENTS.length
    DEMO_CALENDAR_EVENTS = DEMO_CALENDAR_EVENTS.filter((e) => e._id !== id)

    if (DEMO_CALENDAR_EVENTS.length === before) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({ success: true, message: 'Event deleted' })
  } catch (err) {
    console.error('[DELETE /api/calendar]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
