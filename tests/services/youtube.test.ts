/**
 * Tests for services/youtube/index.ts
 *
 * Validates that the YouTube service layer correctly falls back to demo
 * mode when API keys are absent and that the demo adapter returns
 * properly shaped data.
 *
 * Run with: npx jest tests/services/
 */

jest.mock('@/lib/demo-mode', () => {
  const DEMO_CHANNEL = {
    channelId: 'UCdemo',
    channelTitle: 'Demo Channel',
    channelDescription: 'A demo channel for unit tests',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    subscriberCount: 50_000,
    videoCount: 120,
    viewCount: 2_500_000,
    country: 'US',
    publishedAt: '2020-01-01T00:00:00Z',
  }

  const DEMO_VIDEOS = [
    {
      videoId: 'v1',
      title: 'Test Video',
      description: 'A test video',
      thumbnailUrl: 'https://example.com/v1.jpg',
      publishedAt: new Date().toISOString(),
      viewCount: 1000,
      likeCount: 50,
      commentCount: 20,
      duration: 'PT10M',
      tags: ['react', 'nextjs'],
    },
  ]

  const DEMO_COMMENTS = [
    {
      commentId: 'c1',
      videoId: 'v1',
      authorDisplayName: 'Alice',
      textDisplay: 'Great video!',
      likeCount: 5,
      publishedAt: new Date().toISOString(),
      sentiment: 'positive' as const,
    },
  ]

  return {
    DEMO_CHANNEL,
    DEMO_VIDEOS,
    DEMO_COMMENTS,
    isDemoMode: jest.fn(() => true),
  }
})

// ─── YouTubeDemoAdapter Tests ──────────────────────────────────────────────────

describe('YouTubeService (demo mode)', () => {
  let youtubeService: Awaited<ReturnType<typeof getService>>

  async function getService() {
    const mod = await import('@/services/youtube')
    return mod.youtubeService
  }

  beforeEach(async () => {
    jest.resetModules()
    youtubeService = await getService()
  })

  // ── getChannelInfo ──────────────────────────────────────────────────────────
  describe('getChannelInfo', () => {
    it('returns a ChannelInfo object with expected fields', async () => {
      const info = await youtubeService.getChannelInfo('UCdemo')

      expect(info).toMatchObject({
        channelId: expect.any(String),
        channelTitle: expect.any(String),
        channelDescription: expect.any(String),
        thumbnailUrl: expect.any(String),
        subscriberCount: expect.any(Number),
        videoCount: expect.any(Number),
      })
    })

    it('resolves within a reasonable time (< 2s in demo mode)', async () => {
      const start = Date.now()
      await youtubeService.getChannelInfo('UCdemo')
      expect(Date.now() - start).toBeLessThan(2000)
    })
  })

  // ── getRecentVideos ─────────────────────────────────────────────────────────
  describe('getRecentVideos', () => {
    it('returns an object with a videos array', async () => {
      const result = await youtubeService.getRecentVideos('UCdemo')

      expect(result).toHaveProperty('videos')
      expect(Array.isArray(result.videos)).toBe(true)
    })

    it('respects maxResults option', async () => {
      const result = await youtubeService.getRecentVideos('UCdemo', { maxResults: 1 })
      expect(result.videos.length).toBeLessThanOrEqual(1)
    })

    it('each video has required fields', async () => {
      const { videos } = await youtubeService.getRecentVideos('UCdemo')
      if (videos.length > 0) {
        const video = videos[0]
        expect(video).toHaveProperty('videoId')
        expect(video).toHaveProperty('title')
        expect(video).toHaveProperty('publishedAt')
      }
    })
  })

  // ── getVideoComments ────────────────────────────────────────────────────────
  describe('getVideoComments', () => {
    it('returns an object with a comments array', async () => {
      const result = await youtubeService.getVideoComments('v1')

      expect(result).toHaveProperty('comments')
      expect(Array.isArray(result.comments)).toBe(true)
    })

    it('each comment has required fields', async () => {
      const { comments } = await youtubeService.getVideoComments('v1')
      if (comments.length > 0) {
        const c = comments[0]
        expect(c).toHaveProperty('commentId')
        expect(c).toHaveProperty('authorDisplayName')
        expect(c).toHaveProperty('textDisplay')
        expect(c).toHaveProperty('publishedAt')
      }
    })
  })

  // ── syncChannel ─────────────────────────────────────────────────────────────
  describe('syncChannel', () => {
    it('returns a sync result object', async () => {
      const result = await youtubeService.syncChannel('UCdemo')

      expect(result).toMatchObject({
        channelInfo: expect.any(Object),
        videos: expect.any(Array),
        comments: expect.any(Array),
      })
    })
  })
})
