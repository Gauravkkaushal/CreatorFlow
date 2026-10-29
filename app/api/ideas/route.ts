import { NextRequest, NextResponse, connection } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ContentIdea from '@/models/ContentIdea'
import type { ApiResponse } from '@/types'

/**
 * Content ideas back three pages: the planner (all ideas), the calendar
 * (ideas with a scheduledDate) and Stream Studio (livestream ideas).
 */

const IdeaFields = z.object({
  title: z.string().trim().min(1).max(200),
  contentType: z.enum(['video', 'livestream', 'short']),
  status: z.enum(['idea', 'draft', 'approved', 'scheduled', 'published']),
  description: z.string().max(1000),
  outline: z.array(z.string().max(500)).max(30),
  keywords: z.array(z.string().max(100)).max(20),
  draftDescription: z.string().max(5000),
  hook: z.string().max(1000),
  cta: z.string().max(1000),
  notes: z.string().max(2000),
  sourceTopicName: z.string().max(200),
  // null removes the idea from the calendar
  scheduledDate: z.iso.datetime().nullable(),
})
const CreateSchema = IdeaFields.partial().required({ title: true })
const UpdateSchema = IdeaFields.partial().extend({ id: z.string().refine(mongoose.isValidObjectId, 'Invalid id') })

const fail = (error: string, status: number) => NextResponse.json<ApiResponse>({ success: false, error }, { status })

/** The signed-in user's database id, or an error response. */
async function requireUser(): Promise<string | NextResponse> {
  const session = await auth()
  if (!session?.user) return fail('Unauthorized', 401)
  if (!mongoose.isValidObjectId(session.user.id)) {
    return fail('Your account is not linked to the database yet. Make sure MONGODB_URI is set, then sign out and sign in again.', 400)
  }
  if (!(await connectDB())) return fail('MONGODB_URI is empty in .env, so ideas cannot be saved.', 500)
  return session.user.id
}

export async function GET() {
  // Per-user data: opt out of prerendering before the try, so the catch cannot swallow Next's signal
  await connection()
  try {
    const userId = await requireUser()
    if (userId instanceof NextResponse) return userId
    // shortcut: no pagination, fine for one creator's ideas; paginate if users pass ~500
    const ideas = await ContentIdea.find({ userId }).sort({ createdAt: -1 }).limit(500).lean()
    return NextResponse.json<ApiResponse>({ success: true, data: ideas })
  } catch (err) {
    console.error('[GET /api/ideas]', err)
    return fail('Could not load your ideas', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser()
    if (userId instanceof NextResponse) return userId

    const parsed = CreateSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid idea', 400)

    const idea = await ContentIdea.create({ ...parsed.data, userId, scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : undefined })
    return NextResponse.json<ApiResponse>({ success: true, data: idea.toObject() }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/ideas]', err)
    return fail('Could not save your idea', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUser()
    if (userId instanceof NextResponse) return userId

    const parsed = UpdateSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid update', 400)

    const { id, scheduledDate, ...fields } = parsed.data
    // Filtering on userId too means nobody can edit another user's idea by guessing its id
    const idea = await ContentIdea.findOneAndUpdate(
      { _id: id, userId },
      { ...fields, ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }) },
      { returnDocument: 'after', runValidators: true }
    ).lean()
    if (!idea) return fail('Idea not found', 404)
    return NextResponse.json<ApiResponse>({ success: true, data: idea })
  } catch (err) {
    console.error('[PATCH /api/ideas]', err)
    return fail('Could not update your idea', 500)
  }
}
