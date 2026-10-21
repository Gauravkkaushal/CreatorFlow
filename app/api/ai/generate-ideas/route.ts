import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateContentIdeas } from '@/services/ai'
import type { ApiResponse, AIContentIdeaOutput } from '@/types'


export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { topic, tone, targetAudience, format, channelContext } = body

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'topic is required' }, { status: 400 })
    }

    // Build a synthetic topic object from the prompt
    const topicObj = {
      name: topic.trim().slice(0, 100),
      summary: `Audience is requesting content about: ${topic.trim()}`,
      commentCount: 1,
      representativeComments: [`I would love a video about ${topic.trim()}`],
      commonQuestions: [
        `What is ${topic.trim()}?`,
        `How do I get started with ${topic.trim()}?`,
        `What are best practices for ${topic.trim()}?`,
      ],
      painPoints: [`Understanding ${topic.trim()} from scratch`],
      suggestedIdeas: [`Complete guide to ${topic.trim()}`],
      priorityScore: 80,
      scoreExplanation: 'Generated from direct user prompt',
    }

    const contextStr = [
      channelContext,
      tone ? `Tone: ${tone}` : '',
      targetAudience ? `Target audience: ${targetAudience}` : '',
      format ? `Preferred format: ${format}` : '',
    ]
      .filter(Boolean)
      .join('. ')

    const ideas: AIContentIdeaOutput[] = await generateContentIdeas(topicObj, contextStr || undefined)

    return NextResponse.json<ApiResponse<AIContentIdeaOutput[]>>({
      success: true,
      data: ideas,
      message: `Generated ${ideas.length} content idea(s)`,
    })
  } catch (err) {
    console.error('[POST /api/ai/generate-ideas]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
