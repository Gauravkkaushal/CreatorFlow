import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo-mode'
import { getMyVideos } from '@/services/youtube'
import type { ApiResponse, YouTubeVideo } from '@/types'

export async function GET(request: NextRequest) {
  // Read the request before the try: this is what tells Next 16 not to prerender this route, and the catch must not swallow it
  const requested = Number(new URL(request.url).searchParams.get('maxResults')) || 25
  try {
    const session = await auth()

    if (isDemoMode()) {
      return NextResponse.json<ApiResponse<YouTubeVideo[]>>({ success: true, data: await getMyVideos() })
    }

    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.accessToken || session.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Your YouTube access has expired. Please sign in again.' },
        { status: 401 }
      )
    }

    const videos = await getMyVideos(session.accessToken, Math.min(Math.max(requested, 1), 50))

    return NextResponse.json<ApiResponse<YouTubeVideo[]>>({ success: true, data: videos })
  } catch (err) {
    console.error('[GET /api/videos]', err)
    const message = err instanceof Error ? err.message : 'Failed to load videos'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
