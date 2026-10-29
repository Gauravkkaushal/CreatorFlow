import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { isDemoMode, DEMO_COMMENTS, DEMO_TOPICS, DEMO_VIDEOS } from '@/lib/demo-mode'
import connectDB from '@/lib/mongodb'
import AudienceAnalysis from '@/models/AudienceAnalysis'
import { getMyChannel, getMyVideos, getMyVideoComments } from '@/services/youtube'
import { analyzeComments } from '@/services/ai'
import type { ApiResponse } from '@/types'

// 5 videos x 50 comments stays under the AI service's 300-comment cap and costs 7 YouTube quota units
const VIDEOS_TO_SCAN = 5
const COMMENTS_PER_VIDEO = 50

interface SyncResult {
  videosScanned: number
  commentsAnalyzed: number
  topicsFound: number
  isDemo: boolean
  message: string
}

const fail = (error: string, status: number) => NextResponse.json<ApiResponse>({ success: false, error }, { status })

/** Fetch recent comments from the signed-in user's channel, analyze them with AI and save the result. */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) return fail('Unauthorized', 401)

    if (isDemoMode()) {
      return NextResponse.json<ApiResponse<SyncResult>>({
        success: true,
        data: {
          videosScanned: DEMO_VIDEOS.length,
          commentsAnalyzed: DEMO_COMMENTS.length,
          topicsFound: DEMO_TOPICS.length,
          isDemo: true,
          message: 'Demo channel synced',
        },
      })
    }

    const token = session.error ? undefined : session.accessToken
    if (!token) return fail('Your YouTube access has expired. Please sign in again.', 401)
    if (!process.env.MONGODB_URI) return fail('MONGODB_URI is empty in .env. Add your MongoDB connection string and restart the server.', 500)
    if (!process.env.GEMINI_API_KEY) return fail('GEMINI_API_KEY is empty in .env. Add your Gemini API key and restart the server.', 500)
    if (!mongoose.isValidObjectId(session.user.id)) {
      return fail('Your account is not linked to the database yet. Make sure MONGODB_URI is set, then sign out and sign in again.', 400)
    }

    const startedAt = new Date()
    const [channel, videos] = await Promise.all([getMyChannel(token), getMyVideos(token, VIDEOS_TO_SCAN)])
    if (!channel) return fail('No YouTube channel found on this Google account.', 404)

    const comments = (await Promise.all(videos.map((v) => getMyVideoComments(token, v.id, COMMENTS_PER_VIDEO)))).flat()
    if (comments.length === 0) {
      return fail('Your latest videos have no comments to analyze yet.', 422)
    }

    const result = await analyzeComments(comments, `${channel.channelTitle} (latest ${videos.length} videos)`)

    if (!(await connectDB())) return fail('MONGODB_URI is not set, so the analysis cannot be saved.', 500)
    await AudienceAnalysis.create({
      userId: session.user.id,
      channelId: channel.channelId,
      status: 'completed',
      commentsAnalyzed: comments.length,
      totalComments: comments.length,
      topics: result.topics,
      startedAt,
      completedAt: new Date(),
      isDemo: false,
    })

    return NextResponse.json<ApiResponse<SyncResult>>({
      success: true,
      data: {
        videosScanned: videos.length,
        commentsAnalyzed: comments.length,
        topicsFound: result.topics.length,
        isDemo: false,
        message: `Analyzed ${comments.length} comments from ${videos.length} videos and found ${result.topics.length} topics`,
      },
    })
  } catch (err) {
    console.error('[POST /api/channel/sync]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return fail(message, 500)
  }
}
