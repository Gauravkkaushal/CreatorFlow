'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Radio,
  Video,
  Zap,
  Calendar,
} from 'lucide-react'
import { DEMO_CONTENT_IDEAS, isClientDemoMode } from '@/lib/demo-mode'
import { useIdeas, useCreateIdea, useUpdateIdea } from '@/lib/use-ideas'

const isDemo = isClientDemoMode()
import { formatDate } from '@/lib/utils'

// ─── Calendar helpers ───────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function startOfWeek(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isSameDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type EventType = 'video' | 'livestream' | 'short'

interface Event {
  id: string
  title: string
  date: Date
  type: EventType
  status: 'scheduled' | 'published'
  color: string
}

// ─── Event data (absolute hardcoded dates — no runtime Date.now() calls) ──────
const INITIAL_EVENTS: Event[] = [
  {
    id: 'ev-1',
    title: 'JWT Auth Guide',
    date: new Date('2026-10-20T00:00:00'),
    type: 'video',
    status: 'scheduled',
    color: '#6366f1',
  },
  {
    id: 'ev-2',
    title: 'Live Q&A Stream',
    date: new Date('2026-10-26T00:00:00'),
    type: 'livestream',
    status: 'scheduled',
    color: '#3b82f6',
  },
  {
    id: 'ev-3',
    title: 'RSC Quick Take',
    date: new Date('2026-10-15T00:00:00'),
    type: 'short',
    status: 'published',
    color: '#8b5cf6',
  },
]

const TYPE_CONFIG = {
  video: { icon: Video, color: '#6366f1', label: 'Video', bg: 'bg-indigo-100 text-indigo-700' },
  livestream: { icon: Radio, color: '#3b82f6', label: 'Live Stream', bg: 'bg-blue-100 text-blue-700' },
  short: { icon: Zap, color: '#8b5cf6', label: 'Short', bg: 'bg-violet-100 text-violet-700' },
}

export default function CalendarPage() {
  // Static defaults — overridden client-side in useEffect to avoid prerender errors
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(9) // October
  const [today, setToday] = useState<Date | null>(null)
  const [demoEvents, setDemoEvents] = useState<Event[]>(INITIAL_EVENTS)
  const ideas = useIdeas(!isDemo)
  const createIdea = useCreateIdea()
  const updateIdea = useUpdateIdea()
  // Live calendar = saved ideas that have a date
  const events: Event[] = isDemo
    ? demoEvents
    : (ideas.data ?? []).filter((idea) => idea.scheduledDate).map((idea) => ({
        id: idea._id,
        title: idea.title,
        date: new Date(idea.scheduledDate!),
        type: idea.contentType,
        status: idea.status === 'published' ? 'published' : 'scheduled',
        color: TYPE_CONFIG[idea.contentType].color,
      }))
  const unscheduledIdeas = isDemo ? DEMO_CONTENT_IDEAS : (ideas.data ?? []).filter((idea) => !idea.scheduledDate)
  // Set when a saved idea is picked in the add-event form, so it gets scheduled instead of duplicated
  const [pickedIdeaId, setPickedIdeaId] = useState<string | null>(null)
  const saveError = (createIdea.error ?? updateIdea.error)?.message
  const [weekAnchor, setWeekAnchor] = useState(new Date(2026, 9, 21))

  useEffect(() => {
    const now = new Date()
    setToday(now)
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
    setWeekAnchor(now)
  }, [])
  const [view, setView] = useState<'month' | 'week'>('month')
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // New event form
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<EventType>('video')

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(weekAnchor), index))
  const calendarCells: (Date | null)[] = view === 'month'
    ? [...Array.from({ length: firstDay }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => new Date(currentYear, currentMonth, index + 1))]
    : weekDays

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const prevPeriod = () => {
    if (view === 'week') setWeekAnchor((date) => addDays(date, -7))
    else prevMonth()
  }

  const nextPeriod = () => {
    if (view === 'week') setWeekAnchor((date) => addDays(date, 7))
    else nextMonth()
  }

  const getEventsForDate = (date: Date) => events.filter((event) => isSameDay(new Date(event.date), date))

  const handleAddEvent = async () => {
    if (!newTitle.trim() || !selectedDate) return
    if (!isDemo) {
      const scheduledDate = selectedDate.toISOString()
      const picked = ideas.data?.find((idea) => idea._id === pickedIdeaId)
      try {
        if (picked) {
          await updateIdea.mutateAsync({ id: picked._id, scheduledDate, status: picked.status === 'published' ? 'published' : 'scheduled' })
        } else {
          await createIdea.mutateAsync({ title: newTitle.trim().slice(0, 200), contentType: newType, status: 'scheduled', scheduledDate })
        }
        setShowModal(false)
      } catch {
        // saveError shows the message in the form
      }
      return
    }
    const newEvent: Event = {
      id: `ev-${Date.now()}`,
      title: newTitle,
      date: selectedDate,
      type: newType,
      status: 'scheduled' as const,
      color: TYPE_CONFIG[newType].color,
    }
    setDemoEvents((prev) => [...prev, newEvent])
    setShowModal(false)
  }

  const handleRemoveEvent = (id: string) => {
    // Live: only unschedule, so the idea stays in the content planner
    if (isDemo) setDemoEvents((prev) => prev.filter((e) => e.id !== id))
    else updateIdea.mutate({ id, scheduledDate: null })
    setSelectedEvent(null)
  }

  const switchView = (v: 'month' | 'week') => {
    if (v === view) return
    if (v === 'week') {
      const isViewingCurrentMonth = today !== null && today.getFullYear() === currentYear && today.getMonth() === currentMonth
      setWeekAnchor(isViewingCurrentMonth ? today : new Date(currentYear, currentMonth, 1))
    } else {
      setCurrentYear(weekAnchor.getFullYear())
      setCurrentMonth(weekAnchor.getMonth())
    }
    setView(v)
  }

  const isToday = (date: Date) => today !== null && isSameDay(today, date)
  const calendarLabel = view === 'week'
    ? `${MONTHS[weekDays[0].getMonth()]} ${weekDays[0].getDate()} – ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getDate()}, ${weekDays[6].getFullYear()}`
    : `${MONTHS[currentMonth]} ${currentYear}`

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-7xl flex-col gap-4 animate-fade-in">
      <div className="flex shrink-0 justify-end">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/8 bg-white/[0.04] p-1">
            {(['month', 'week'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  view === v ? 'bg-violet-500 text-white shadow-lg shadow-violet-950/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setSelectedDate(today); setShowModal(true); setNewTitle(''); setNewType('video'); setSelectedEvent(null); setPickedIdeaId(null); createIdea.reset(); updateIdea.reset() }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#151b2e] shadow-xl shadow-black/20">
        {/* Month nav */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <button onClick={prevPeriod} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">
              {calendarLabel}
            </h2>
            <button
              onClick={() => { const target = today ?? new Date(currentYear, currentMonth, 1); setCurrentYear(target.getFullYear()); setCurrentMonth(target.getMonth()); setWeekAnchor(target) }}
              className="text-xs text-violet-300 hover:text-white font-medium"
            >
              Today
            </button>
          </div>
          <button onClick={nextPeriod} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/8 bg-[#10162a]">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid min-h-0 flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${Math.ceil(calendarCells.length / 7)}, minmax(0, 1fr))` }}>
          {calendarCells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-0 border-b border-r border-white/5 bg-black/10" />
            const dayEvents = getEventsForDate(date)
            const isTd = isToday(date)

            return (
              <div
                key={date.toISOString()}
                onClick={() => { setSelectedDate(date); setSelectedEvent(null); setShowModal(true); setNewTitle(''); setNewType('video'); setPickedIdeaId(null); createIdea.reset(); updateIdea.reset() }}
                className={`min-h-0 overflow-hidden border-b border-r border-white/7 p-2.5 cursor-pointer hover:bg-white/[0.035] transition-colors ${
                  isTd ? 'bg-violet-500/10' : ''
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${
                  isTd ? 'bg-violet-500 text-white shadow-lg shadow-violet-950/40' : 'text-slate-300 hover:bg-white/10'
                }`}>
                  {date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const cfg = TYPE_CONFIG[ev.type]
                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowModal(false) }}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                      >
                        <cfg.icon className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    )
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-slate-500 pl-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event detail side panel */}
      {selectedEvent && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#151b2e] shadow-2xl shadow-black/50 border-l border-white/8 z-40 flex flex-col animate-slide-in-right">
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <h3 className="text-base font-semibold text-white">Event Details</h3>
            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedEvent.color + '20' }}>
                {(() => {
                  const cfg = TYPE_CONFIG[selectedEvent.type]
                  return <cfg.icon className="w-5 h-5" style={{ color: selectedEvent.color }} />
                })()}
              </div>
              <div>
                <h4 className="font-semibold text-white">{selectedEvent.title}</h4>
                <span className={`badge text-xs ${TYPE_CONFIG[selectedEvent.type].bg}`}>
                  {TYPE_CONFIG[selectedEvent.type].label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formatDate(selectedEvent.date)}
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${
                selectedEvent.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {selectedEvent.status}
              </span>
            </div>
          </div>
          <div className="p-5 border-t border-white/8 space-y-2">
            <button
              onClick={() => handleRemoveEvent(selectedEvent.id)}
              className="w-full px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Remove Event
            </button>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-[#151b2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h2 className="text-base font-semibold text-white">Schedule Content</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedDate ? formatDate(selectedDate) : '—'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. JWT Authentication Tutorial"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setPickedIdeaId(null) }}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(TYPE_CONFIG) as [EventType, typeof TYPE_CONFIG['video']][]).map(([type, cfg]) => (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        newType === type ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <cfg.icon className={`w-5 h-5 ${newType === type ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className={`text-xs font-medium ${newType === type ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Quick add from ideas */}
              {saveError && <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{saveError}</p>}
              {unscheduledIdeas.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Or pick from your ideas:</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {unscheduledIdeas.map((idea) => (
                      <button
                        key={idea._id}
                        onClick={() => { setNewTitle(idea.title); setNewType(idea.contentType); setPickedIdeaId(idea._id) }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors truncate"
                      >
                        {idea.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-white/8">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newTitle.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
