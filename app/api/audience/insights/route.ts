import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo-mode'
import { DEMO_TOPICS, DEMO_COMMENTS } from '@/lib/demo-mode'
import { getLatestAnalysis } from '@/lib/analysis'
import type { ApiResponse } from '@/types'
import type { AudienceTopicOutput } from '@/schemas'

export interface LiveInsights {
  topics: (AudienceTopicOutput & { _id: string })[]
  totalComments: number
  analyzedAt: string
  isDemo: false
}


interface InsightResponse {
  topics: typeof DEMO_TOPICS
  sentimentSummary: {
    positive: number
    neutral: number
    negative: number
  }
  topQuestions: string[]
  totalComments: number
  isDemo: boolean
}

export async function GET(request: NextRequest) {
  // Read the request before the try: this is what tells Next 16 not to prerender this route, and the catch must not swallow it
  const { searchParams } = new URL(request.url)
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const videoId = searchParams.get('videoId')
    const channelId = searchParams.get('channelId')

    if (isDemoMode()) {
      // Return demo insight data
      const filteredComments = videoId
        ? DEMO_COMMENTS.filter((c) => c.videoId === videoId)
        : DEMO_COMMENTS

      const allQuestions = DEMO_TOPICS.flatMap((t) => t.commonQuestions)

      const insightData: InsightResponse = {
        topics: DEMO_TOPICS,
        sentimentSummary: { positive: 62, neutral: 24, negative: 14 },
        topQuestions: allQuestions.slice(0, 5),
        totalComments: filteredComments.length || DEMO_COMMENTS.length,
        isDemo: true,
      }

      return NextResponse.json<ApiResponse<InsightResponse>>({
        success: true,
        data: insightData,
        message: 'Demo insights returned',
      })
    }

    const latest = await getLatestAnalysis(session.user.id)
    // data: null (not 404) so the page can show its "analyze your comments" state
    return NextResponse.json<ApiResponse<LiveInsights | null>>({
      success: true,
      data: latest && {
        topics: latest.topics as unknown as LiveInsights['topics'],
        totalComments: latest.totalComments,
        analyzedAt: (latest.completedAt ?? latest.createdAt).toISOString(),
        isDemo: false,
      },
    })

  } catch (err) {
    console.error('[GET /api/audience/insights]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
