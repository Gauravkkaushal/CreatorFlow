import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateVideoOutline, generateVideoDescription } from '@/services/ai'
import type { ApiResponse } from '@/types'


interface GenerateScriptResult {
  outline: string[]
  description: string
  hook: string
  cta: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, topic, keywords } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'title is required' }, { status: 400 })
    }

    const topicObj = topic ?? {
      name: title,
      summary: `Video about: ${title}`,
      commentCount: 0,
      representativeComments: [],
      commonQuestions: [],
      painPoints: [],
      suggestedIdeas: [],
      priorityScore: 70,
      scoreExplanation: 'User-provided title',
    }

    const [outline, description] = await Promise.all([
      generateVideoOutline(title.trim(), topicObj),
      generateVideoDescription(title.trim(), [], keywords ?? []),
    ])

    const hook = outline[0] ?? `In this video, we'll cover everything about ${title}.`
    const cta = 'If you found this helpful, smash the like button and subscribe for more content! Drop your questions in the comments below. 🔔'

    const result: GenerateScriptResult = { outline, description, hook, cta }

    return NextResponse.json<ApiResponse<GenerateScriptResult>>({
      success: true,
      data: result,
    })
  } catch (err) {
    console.error('[POST /api/ai/generate-script]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
