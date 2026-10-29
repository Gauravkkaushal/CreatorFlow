import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isDemoMode, DEMO_CHANNEL } from '@/lib/demo-mode'
import { getMyChannel, getChannelInfo } from '@/services/youtube'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (isDemoMode()) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: DEMO_CHANNEL,
        message: 'Demo channel active',
      })
    }

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try fetching channel using OAuth access token
    if (session.accessToken) {
      try {
        const channel = await getMyChannel(session.accessToken)
        if (channel) {
          return NextResponse.json<ApiResponse>({
            success: true,
            data: channel,
            message: 'Connected YouTube channel loaded',
          })
        }
      } catch (err) {
        console.warn('[GET /api/channel] OAuth channel lookup warning:', err)
      }
    }

    // Check if channelId was passed in searchParams as fallback
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    if (channelId) {
      try {
        const channel = await getChannelInfo(channelId)
        return NextResponse.json<ApiResponse>({
          success: true,
          data: channel,
          message: 'Channel retrieved by ID',
        })
      } catch (err) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: err instanceof Error ? err.message : 'Channel not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: null,
      message: 'No YouTube channel directly found on this Google account. Connect using Channel ID.',
    })
  } catch (err) {
    console.error('[GET /api/channel]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && !isDemoMode()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { channelId } = body

    if (!channelId || typeof channelId !== 'string') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'channelId is required' },
        { status: 400 }
      )
    }

    const channel = await getChannelInfo(channelId)
    return NextResponse.json<ApiResponse>({
      success: true,
      data: channel,
      message: `Connected channel ${channel.channelTitle}`,
    })
  } catch (err) {
    console.error('[POST /api/channel]', err)
    const message = err instanceof Error ? err.message : 'Failed to connect channel'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
