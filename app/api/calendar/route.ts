import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo-mode'
import type { ApiResponse, CalendarEvent } from '@/types'


// In-memory store for demo mode (resets on server restart)
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

// GET — list events
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
      events = events.filter((e) => {
        const d = new Date(e.startDate)
        return d.getMonth() === parseInt(month) && d.getFullYear() === parseInt(year)
      })
    }

    return NextResponse.json<ApiResponse<CalendarEvent[]>>({ success: true, data: events })
  } catch (err) {
    console.error('[GET /api/calendar]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST — create event
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, startDate, type, status, description, timezone, color } = body

    if (!title || !startDate || !type) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'title, startDate, type are required' }, { status: 400 })
    }

    const newEvent: CalendarEvent = {
      _id: `cal-${Date.now()}`,
      userId: 'demo-user',
      title,
      description,
      startDate: new Date(startDate),
      timezone: timezone ?? 'UTC',
      type,
      status: status ?? 'scheduled',
      color: color ?? '#6366f1',
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

// PUT — update event
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { _id, ...updates } = body

    if (!_id) {
      return NextResponse.json<ApiResponse>({ success: false, error: '_id is required' }, { status: 400 })
    }

    const idx = DEMO_CALENDAR_EVENTS.findIndex((e) => e._id === _id)
    if (idx === -1) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Event not found' }, { status: 404 })
    }

    DEMO_CALENDAR_EVENTS[idx] = {
      ...DEMO_CALENDAR_EVENTS[idx],
      ...updates,
      updatedAt: new Date(),
    }

    return NextResponse.json<ApiResponse<CalendarEvent>>({ success: true, data: DEMO_CALENDAR_EVENTS[idx] })
  } catch (err) {
    console.error('[PUT /api/calendar]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove event
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
