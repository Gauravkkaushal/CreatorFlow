import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode, DEMO_VIDEOS } from '@/lib/demo-mode'
import { generateContentIdeas } from '@/services/ai'
import type { ApiResponse } from '@/types'


interface SEOOptimizationResult {
  titles: string[]
  tags: string[]
  description: string
  thumbnailConcepts: string[]
  isDemo: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { videoId, title, currentDescription, currentTags } = body

    if (!title && !videoId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'title or videoId is required' }, { status: 400 })
    }

    let videoTitle = title
    if (!videoTitle && videoId && isDemoMode()) {
      const demoVideo = DEMO_VIDEOS.find((v) => v.id === videoId)
      videoTitle = demoVideo?.title ?? 'YouTube Video'
    }

    // Build a topic object for the AI
    const topicObj = {
      name: videoTitle,
      summary: `Optimize SEO for video: ${videoTitle}`,
      commentCount: 0,
      representativeComments: [],
      commonQuestions: [`How to ${videoTitle}?`, `What is ${videoTitle}?`],
      painPoints: [],
      suggestedIdeas: [videoTitle],
      priorityScore: 85,
      scoreExplanation: 'User-requested optimization',
    }

    const ideas = await generateContentIdeas(topicObj)
    const firstIdea = ideas[0]

    // Build SEO result from AI output
    const optimizedTitles = firstIdea
      ? [firstIdea.title, ...firstIdea.titleSuggestions].slice(0, 4)
      : [
          `${videoTitle} (Complete Guide ${new Date().getFullYear()})`,
          `How to Master ${videoTitle}`,
          `${videoTitle} Tutorial for Beginners`,
          `${videoTitle} — Everything You Need to Know`,
        ]

    const optimizedTags = firstIdea
      ? firstIdea.tags
      : (currentTags ?? ['tutorial', 'programming', 'webdev'])

    const optimizedDescription = firstIdea?.description ?? currentDescription ?? `Watch this comprehensive video about ${videoTitle}.`

    const thumbnailConcepts = [
      `Bold text "${videoTitle.split(' ').slice(0, 3).join(' ')}" on dark gradient background with code snippet`,
      `Split screen: terminal output left + result/UI right, neon accent color overlay`,
      `Presenter face (bottom left), large title card, red "TUTORIAL" badge in corner`,
    ]

    const result: SEOOptimizationResult = {
      titles: optimizedTitles,
      tags: optimizedTags,
      description: optimizedDescription,
      thumbnailConcepts,
      isDemo: isDemoMode(),
    }

    return NextResponse.json<ApiResponse<SEOOptimizationResult>>({ success: true, data: result })
  } catch (err) {
    console.error('[POST /api/videos/optimize]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
