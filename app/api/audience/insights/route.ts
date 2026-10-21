import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo-mode'
import { DEMO_TOPICS, DEMO_COMMENTS } from '@/lib/demo-mode'
import type { ApiResponse } from '@/types'


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
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
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

    // In a real implementation, we'd query the AudienceAnalysis MongoDB collection
    // and return the most recent analysis for the given channelId/videoId.
    // Placeholder for live mode:
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'No analysis found. Run a comment analysis first.',
    }, { status: 404 })

  } catch (err) {
    console.error('[GET /api/audience/insights]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
