import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo-mode'
import { getRecentVideos, getVideoComments } from '@/services/youtube'
import type { ApiResponse } from '@/types'


interface SyncResult {
  videosFound: number
  commentsFound: number
  isDemo: boolean
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { channelId } = body

    if (!channelId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'channelId is required' }, { status: 400 })
    }

    // Fetch recent videos (demo or live)
    const { videos } = await getRecentVideos(channelId, { maxResults: 10 })

    // Fetch comments for the first few videos
    let totalComments = 0
    for (const video of videos.slice(0, 3)) {
      const { comments } = await getVideoComments(video.id, { maxResults: 100 })
      totalComments += comments.length

      // In a real app: upsert comments into MongoDB, trigger AI analysis job
      // For now we log the sync activity
      console.log(`[channel/sync] Fetched ${comments.length} comments for video ${video.id}`)
    }

    // TODO (production): Persist to MongoDB, trigger background analysis
    const result: SyncResult = {
      videosFound: videos.length,
      commentsFound: totalComments,
      isDemo: isDemoMode(),
      message: `Successfully synced ${videos.length} videos and ${totalComments} comments from channel ${channelId}`,
    }

    return NextResponse.json<ApiResponse<SyncResult>>({ success: true, data: result })
  } catch (err) {
    console.error('[POST /api/channel/sync]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
