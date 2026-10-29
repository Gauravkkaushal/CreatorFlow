/**
 * YouTube Service Layer
 *
 * Wraps YouTube Data API v3. Falls back to demo mode when
 * YOUTUBE_API_KEY / OAuth token is not available.
 */

import {
  DEMO_CHANNEL,
  DEMO_VIDEOS,
  DEMO_COMMENTS,
  isDemoMode,
} from '@/lib/demo-mode'
import type { YouTubeVideo, YouTubeComment, ConnectedChannel } from '@/types'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ChannelInfo {
  channelId: string
  channelTitle: string
  channelDescription: string
  thumbnailUrl: string
  subscriberCount: number
  videoCount: number
}

export interface FetchVideosOptions {
  maxResults?: number
  pageToken?: string
}

export interface FetchCommentsOptions {
  maxResults?: number
  pageToken?: string
  order?: 'time' | 'relevance'
}

// ─────────────────────────────────────────────
// Demo Adapter
// ─────────────────────────────────────────────

class YouTubeDemoAdapter {
  async getChannelInfo(_channelId: string): Promise<ChannelInfo> {
    await new Promise((r) => setTimeout(r, 200))
    return {
      channelId: DEMO_CHANNEL.channelId,
      channelTitle: DEMO_CHANNEL.channelTitle,
      channelDescription: DEMO_CHANNEL.channelDescription,
      thumbnailUrl: DEMO_CHANNEL.thumbnailUrl,
      subscriberCount: DEMO_CHANNEL.subscriberCount,
      videoCount: DEMO_CHANNEL.videoCount,
    }
  }

  async getRecentVideos(
    _channelId: string,
    options: FetchVideosOptions = {}
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
    await new Promise((r) => setTimeout(r, 300))
    const { maxResults = 10 } = options
    return {
      videos: DEMO_VIDEOS.slice(0, maxResults) as YouTubeVideo[],
    }
  }

  async getVideoComments(
    _videoId: string,
    options: FetchCommentsOptions = {}
  ): Promise<{ comments: YouTubeComment[]; nextPageToken?: string }> {
    await new Promise((r) => setTimeout(r, 300))
    const { maxResults = 50 } = options
    const filtered = DEMO_COMMENTS.filter((c) => c.videoId === _videoId)
    const all = filtered.length > 0 ? filtered : DEMO_COMMENTS
    return {
      comments: all.slice(0, maxResults) as YouTubeComment[],
    }
  }

  async getAllCommentsForVideo(videoId: string): Promise<YouTubeComment[]> {
    const { comments } = await this.getVideoComments(videoId, { maxResults: 300 })
    return comments
  }

  async getMyChannel(_accessToken?: string): Promise<ChannelInfo | null> {
    await new Promise((r) => setTimeout(r, 200))
    return {
      channelId: DEMO_CHANNEL.channelId,
      channelTitle: DEMO_CHANNEL.channelTitle,
      channelDescription: DEMO_CHANNEL.channelDescription,
      thumbnailUrl: DEMO_CHANNEL.thumbnailUrl,
      subscriberCount: DEMO_CHANNEL.subscriberCount,
      videoCount: DEMO_CHANNEL.videoCount,
    }
  }

  async getMyVideos(maxResults = 25): Promise<YouTubeVideo[]> {
    const { videos } = await this.getRecentVideos('', { maxResults })
    return videos
  }
}

// ─────────────────────────────────────────────
// Live Adapter (YouTube Data API v3)
// ─────────────────────────────────────────────

class YouTubeLiveAdapter {
  private apiKey?: string
  private BASE = 'https://www.googleapis.com/youtube/v3'

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  private async get<T>(path: string, params: Record<string, string | number>, token?: string): Promise<T> {
    const url = new URL(this.BASE + path)
    if (this.apiKey) {
      url.searchParams.set('key', this.apiKey)
    }
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v))
    }
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Per-user (token) responses must never land in the shared fetch cache
    const res = await fetch(url.toString(), token ? { headers, cache: 'no-store' } : { next: { revalidate: 300 } })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`YouTube API error ${res.status}: ${JSON.stringify(err)}`)
    }
    return res.json() as T
  }

  async getMyChannel(accessToken: string): Promise<ChannelInfo | null> {
    const data = await this.get<{
      items?: Array<{
        id: string
        snippet: {
          title: string
          description: string
          thumbnails: { default: { url: string }; medium?: { url: string }; high?: { url: string } }
        }
        statistics: { subscriberCount: string; videoCount: string }
      }>
    }>('/channels', {
      part: 'snippet,statistics',
      mine: 'true',
    }, accessToken)

    const item = data.items?.[0]
    if (!item) return null

    return {
      channelId: item.id,
      channelTitle: item.snippet.title,
      channelDescription: item.snippet.description || '',
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      subscriberCount: parseInt(item.statistics?.subscriberCount || '0', 10),
      videoCount: parseInt(item.statistics?.videoCount || '0', 10),
    }
  }

  async getChannelInfo(channelId: string): Promise<ChannelInfo> {
    const data = await this.get<{
      items: Array<{
        id: string
        snippet: { title: string; description: string; thumbnails: { default: { url: string } } }
        statistics: { subscriberCount: string; videoCount: string }
      }>
    }>('/channels', {
      part: 'snippet,statistics',
      id: channelId,
    })

    const item = data.items?.[0]
    if (!item) throw new Error(`Channel not found: ${channelId}`)

    return {
      channelId: item.id,
      channelTitle: item.snippet.title,
      channelDescription: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.default.url,
      subscriberCount: parseInt(item.statistics.subscriberCount || '0'),
      videoCount: parseInt(item.statistics.videoCount || '0'),
    }
  }

  async getRecentVideos(
    channelId: string,
    options: FetchVideosOptions = {}
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
    const { maxResults = 10, pageToken } = options

    // Step 1 — search for video IDs
    const searchParams: Record<string, string | number> = {
      part: 'snippet',
      channelId,
      type: 'video',
      order: 'date',
      maxResults,
    }
    if (pageToken) searchParams.pageToken = pageToken

    const searchData = await this.get<{
      items: Array<{ id: { videoId: string } }>
      nextPageToken?: string
    }>('/search', searchParams)

    const videos = await this.getVideoDetails(searchData.items.map((i) => i.id.videoId))
    return { videos, nextPageToken: searchData.nextPageToken }
  }

  /** Videos of the signed-in user's own channel, newest first, including private and unlisted ones. */
  async getMyVideos(accessToken: string, maxResults = 25): Promise<YouTubeVideo[]> {
    // Uploads playlist costs 2 quota units vs 100 for /search
    const channels = await this.get<{
      items?: Array<{ contentDetails: { relatedPlaylists: { uploads: string } } }>
    }>('/channels', { part: 'contentDetails', mine: 'true' }, accessToken)

    const uploads = channels.items?.[0]?.contentDetails.relatedPlaylists.uploads
    if (!uploads) return []

    const playlist = await this.get<{
      items?: Array<{ contentDetails: { videoId: string } }>
    }>('/playlistItems', { part: 'contentDetails', playlistId: uploads, maxResults }, accessToken)

    return this.getVideoDetails(playlist.items?.map((i) => i.contentDetails.videoId) ?? [], accessToken)
  }

  private async getVideoDetails(ids: string[], token?: string): Promise<YouTubeVideo[]> {
    if (!ids.length) return []

    const videoData = await this.get<{
      items: Array<{
        id: string
        snippet: {
          title: string
          description: string
          publishedAt: string
          thumbnails: { medium: { url: string } }
          tags?: string[]
          categoryId?: string
        }
        statistics: { viewCount?: string; likeCount?: string; commentCount?: string }
        contentDetails: { duration: string }
        status: { privacyStatus: string }
      }>
    }>('/videos', {
      part: 'snippet,statistics,contentDetails,status',
      id: ids.join(','),
    }, token)

    return videoData.items.map((v) => ({
      id: v.id,
      title: v.snippet.title,
      description: v.snippet.description,
      thumbnailUrl: v.snippet.thumbnails.medium?.url,
      publishedAt: v.snippet.publishedAt,
      privacyStatus: v.status.privacyStatus as YouTubeVideo['privacyStatus'],
      viewCount: parseInt(v.statistics.viewCount ?? '0'),
      likeCount: parseInt(v.statistics.likeCount ?? '0'),
      commentCount: parseInt(v.statistics.commentCount ?? '0'),
      tags: v.snippet.tags,
      categoryId: v.snippet.categoryId,
      duration: v.contentDetails.duration,
    }))
  }

  async getVideoComments(
    videoId: string,
    options: FetchCommentsOptions = {},
    token?: string
  ): Promise<{ comments: YouTubeComment[]; nextPageToken?: string }> {
    const { maxResults = 100, pageToken, order = 'relevance' } = options
    const params: Record<string, string | number> = {
      part: 'snippet',
      videoId,
      maxResults,
      order,
      textFormat: 'plainText',
    }
    if (pageToken) params.pageToken = pageToken

    const data = await this.get<{
      items: Array<{
        id: string
        snippet: {
          topLevelComment: {
            id: string
            snippet: {
              videoId: string
              textDisplay: string
              authorDisplayName: string
              authorChannelId?: { value: string }
              likeCount: number
              publishedAt: string
              updatedAt: string
            }
          }
        }
      }>
      nextPageToken?: string
    }>('/commentThreads', params, token)

    const comments: YouTubeComment[] = data.items.map((item) => {
      const s = item.snippet.topLevelComment.snippet
      return {
        id: item.snippet.topLevelComment.id,
        videoId: s.videoId,
        text: s.textDisplay,
        authorName: s.authorDisplayName,
        authorChannelId: s.authorChannelId?.value,
        likeCount: s.likeCount,
        publishedAt: s.publishedAt,
        updatedAt: s.updatedAt,
      }
    })

    return { comments, nextPageToken: data.nextPageToken }
  }

  async getAllCommentsForVideo(videoId: string, limit = 300): Promise<YouTubeComment[]> {
    const all: YouTubeComment[] = []
    let pageToken: string | undefined

    while (all.length < limit) {
      const remaining = limit - all.length
      const { comments, nextPageToken } = await this.getVideoComments(videoId, {
        maxResults: Math.min(remaining, 100),
        pageToken,
      })
      all.push(...comments)
      if (!nextPageToken) break
      pageToken = nextPageToken
    }

    return all
  }
}

// ─────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────

let _youtubeAdapter: YouTubeLiveAdapter | YouTubeDemoAdapter | null = null

export function getYouTubeService(): YouTubeLiveAdapter | YouTubeDemoAdapter {
  if (_youtubeAdapter) return _youtubeAdapter

  const apiKey = process.env.YOUTUBE_API_KEY
  if (isDemoMode() || !apiKey) {
    _youtubeAdapter = new YouTubeDemoAdapter()
  } else {
    _youtubeAdapter = new YouTubeLiveAdapter(apiKey)
  }
  return _youtubeAdapter
}

export const getMyChannel = async (accessToken?: string): Promise<ChannelInfo | null> => {
  if (isDemoMode()) {
    return new YouTubeDemoAdapter().getMyChannel()
  }
  if (!accessToken) return null
  const adapter = new YouTubeLiveAdapter(process.env.YOUTUBE_API_KEY)
  return adapter.getMyChannel(accessToken)
}

/** Top comments on one of the signed-in user's videos; [] when the video has comments turned off. */
export const getMyVideoComments = async (accessToken: string, videoId: string, maxResults = 50): Promise<YouTubeComment[]> => {
  if (isDemoMode()) {
    return (await new YouTubeDemoAdapter().getVideoComments(videoId, { maxResults })).comments
  }
  try {
    const { comments } = await new YouTubeLiveAdapter(process.env.YOUTUBE_API_KEY).getVideoComments(videoId, { maxResults }, accessToken)
    return comments
  } catch (err) {
    if (String(err).includes('commentsDisabled')) return []
    throw err
  }
}

export const getMyVideos = async (accessToken?: string, maxResults?: number): Promise<YouTubeVideo[]> => {
  if (isDemoMode()) {
    return new YouTubeDemoAdapter().getMyVideos(maxResults)
  }
  if (!accessToken) return []
  return new YouTubeLiveAdapter(process.env.YOUTUBE_API_KEY).getMyVideos(accessToken, maxResults)
}

// Named exports
export const getChannelInfo = (channelId: string) =>
  getYouTubeService().getChannelInfo(channelId)

export const getRecentVideos = (channelId: string, options?: FetchVideosOptions) =>
  getYouTubeService().getRecentVideos(channelId, options)

export const getVideoComments = (videoId: string, options?: FetchCommentsOptions) =>
  getYouTubeService().getVideoComments(videoId, options)

export const getAllCommentsForVideo = (videoId: string, limit?: number) =>
  getYouTubeService().getAllCommentsForVideo(videoId, limit)

export const youtubeService = {
  getChannelInfo: (channelId: string) => getYouTubeService().getChannelInfo(channelId),
  getMyChannel: (accessToken?: string) => getMyChannel(accessToken),
  getRecentVideos: (channelId: string, options?: FetchVideosOptions) => getYouTubeService().getRecentVideos(channelId, options),
  getVideoComments: (videoId: string, options?: FetchCommentsOptions) => getYouTubeService().getVideoComments(videoId, options),
  getAllCommentsForVideo: (videoId: string, limit?: number) => getYouTubeService().getAllCommentsForVideo(videoId, limit),
  syncChannel: async (channelId: string) => {
    const service = getYouTubeService()
    const channelInfo = await service.getChannelInfo(channelId)
    const { videos } = await service.getRecentVideos(channelId, { maxResults: 10 })
    const firstVideoId = (videos[0] as { id?: string; videoId?: string })?.id ?? (videos[0] as { id?: string; videoId?: string })?.videoId ?? 'demo-video-1'
    const { comments } = await service.getVideoComments(firstVideoId, { maxResults: 50 })
    return {
      channelInfo,
      videos,
      comments,
      syncedAt: new Date(),
    }
  },
}

// Helper to build a ConnectedChannel-like object from live info
export function channelInfoToConnected(
  info: ChannelInfo,
  userId: string
): Omit<ConnectedChannel, '_id' | 'connectedAt' | 'updatedAt'> {
  return {
    userId,
    channelId: info.channelId,
    channelTitle: info.channelTitle,
    channelDescription: info.channelDescription,
    thumbnailUrl: info.thumbnailUrl,
    subscriberCount: info.subscriberCount,
    videoCount: info.videoCount,
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    status: 'active',
  }
}
