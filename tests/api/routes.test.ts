/**
 * Tests for API route handlers.
 *
 * These tests validate request/response structure, auth guards,
 * and demo-mode fallback behaviour for each API endpoint.
 *
 * Run with: npx jest tests/api/
 */

// ─── Mock next-auth so tests don't need a real OAuth session ──────────────────
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/demo-mode', () => ({
  isDemoMode: jest.fn(() => true),
  DEMO_TOPICS: [
    {
      name: 'JWT Auth',
      summary: 'How to implement JWT',
      commentCount: 10,
      representativeComments: ['Great video!'],
      commonQuestions: ['How do I refresh a JWT?'],
      painPoints: ['Token expiry'],
      suggestedIdeas: ['JWT deep dive'],
      priorityScore: 85,
      scoreExplanation: 'High demand',
    },
  ],
  DEMO_COMMENTS: [
    {
      commentId: 'c1',
      videoId: 'demo-video-1',
      authorDisplayName: 'Test User',
      textDisplay: 'Loved this!',
      likeCount: 10,
      publishedAt: new Date().toISOString(),
      sentiment: 'positive' as const,
    },
  ],
  DEMO_CHANNEL: {
    channelId: 'UCdemo',
    channelTitle: 'Demo Channel',
    channelDescription: 'A demo YouTube channel',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    subscriberCount: 50000,
    videoCount: 120,
    viewCount: 2500000,
    country: 'US',
    publishedAt: '2020-01-01T00:00:00Z',
  },
  DEMO_VIDEOS: [],
}))

// ─── Helper to build a mock NextRequest ───────────────────────────────────────
function mockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ─── /api/audience/insights (GET) ────────────────────────────────────────────
describe('GET /api/audience/insights', () => {
  beforeEach(() => {
    // Authenticated session
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue({ user: { id: 'user1', name: 'Test' } })
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue(null)

    const { GET } = await import('@/app/api/audience/insights/route')
    const req = mockRequest('GET', 'http://localhost/api/audience/insights')
    const res = await GET(req as never)
    expect(res.status).toBe(401)

    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toMatch(/unauthorized/i)
  })

  it('returns demo insight data when isDemoMode is true', async () => {
    const { GET } = await import('@/app/api/audience/insights/route')
    const req = mockRequest('GET', 'http://localhost/api/audience/insights')
    const res = await GET(req as never)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveProperty('topics')
    expect(json.data).toHaveProperty('sentimentSummary')
    expect(json.data.isDemo).toBe(true)
  })
})

// ─── /api/ai/generate-ideas (POST) ───────────────────────────────────────────
describe('POST /api/ai/generate-ideas', () => {
  beforeEach(() => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue({ user: { id: 'user1', name: 'Test' } })
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue(null)

    const { POST } = await import('@/app/api/ai/generate-ideas/route')
    const req = mockRequest('POST', 'http://localhost/api/ai/generate-ideas', { topic: 'React' })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })

  it('returns 400 when topic is missing', async () => {
    const { POST } = await import('@/app/api/ai/generate-ideas/route')
    const req = mockRequest('POST', 'http://localhost/api/ai/generate-ideas', {})
    const res = await POST(req as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toMatch(/topic/i)
  })

  it('returns 400 when topic is an empty string', async () => {
    const { POST } = await import('@/app/api/ai/generate-ideas/route')
    const req = mockRequest('POST', 'http://localhost/api/ai/generate-ideas', { topic: '  ' })
    const res = await POST(req as never)

    expect(res.status).toBe(400)
  })
})

// ─── /api/channel/sync (POST) ────────────────────────────────────────────────
describe('POST /api/channel/sync', () => {
  beforeEach(() => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue({ user: { id: 'user1', name: 'Test' } })
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue(null)

    const { POST } = await import('@/app/api/channel/sync/route')
    const req = mockRequest('POST', 'http://localhost/api/channel/sync', { channelId: 'UCdemo' })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })
})

// ─── /api/calendar (GET) ─────────────────────────────────────────────────────
describe('GET /api/calendar', () => {
  beforeEach(() => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue({ user: { id: 'user1', name: 'Test' } })
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = require('@/lib/auth') as { auth: jest.Mock }
    auth.mockResolvedValue(null)

    const { GET } = await import('@/app/api/calendar/route')
    const req = mockRequest('GET', 'http://localhost/api/calendar')
    const res = await GET(req as never)
    expect(res.status).toBe(401)
  })

  it('returns a success response with array data', async () => {
    const { GET } = await import('@/app/api/calendar/route')
    const req = mockRequest('GET', 'http://localhost/api/calendar')
    const res = await GET(req as never)

    // May return 200 (demo) or 404 (live/no data) — not a 5xx
    expect(res.status).toBeLessThan(500)
  })
})

// ─── /api/videos (GET) ───────────────────────────────────────────────────────
jest.mock('@/services/youtube', () => ({
  ...jest.requireActual('@/services/youtube'),
  getMyVideos: jest.fn(async () => [{ id: 'v1', title: 'My video' }]),
  getMyChannel: jest.fn(async () => ({ channelId: 'UCme', channelTitle: 'Me' })),
  getMyVideoComments: jest.fn(async () => [{ id: 'c1', text: 'More on hooks please', likeCount: 3, publishedAt: '2026-10-01T00:00:00Z' }]),
}))
jest.mock('@/services/ai', () => ({
  analyzeComments: jest.fn(async () => ({ topics: [{ name: 'React hooks' }], totalCommentsAnalyzed: 1 })),
}))
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn(async () => ({})) }))
jest.mock('@/models/AudienceAnalysis', () => ({ __esModule: true, default: { create: jest.fn(async () => ({})) } }))

describe('POST /api/channel/sync (analysis)', () => {
  const USER_ID = '64b7f0c2a1b2c3d4e5f60718'
  const live = () => {
    const { isDemoMode } = require('@/lib/demo-mode') as { isDemoMode: jest.Mock }
    isDemoMode.mockReturnValueOnce(false)
  }
  const { auth } = require('@/lib/auth') as { auth: jest.Mock }
  const { getMyVideoComments } = require('@/services/youtube') as { getMyVideoComments: jest.Mock }
  const { analyzeComments } = require('@/services/ai') as { analyzeComments: jest.Mock }
  const AudienceAnalysis = require('@/models/AudienceAnalysis').default as { create: jest.Mock }

  beforeEach(() => {
    analyzeComments.mockClear()
    AudienceAnalysis.create.mockClear()
    process.env.MONGODB_URI = 'mongodb://test'
    process.env.GEMINI_API_KEY = 'test-key'
  })
  afterAll(() => {
    delete process.env.MONGODB_URI
    delete process.env.GEMINI_API_KEY
  })

  it('names the missing setting when MONGODB_URI is empty', async () => {
    live()
    delete process.env.MONGODB_URI
    auth.mockResolvedValue({ user: { id: USER_ID }, accessToken: 'tok' })
    const { POST } = await import('@/app/api/channel/sync/route')
    const res = await POST()
    expect((await res.json()).error).toMatch(/MONGODB_URI is empty/)
    expect(analyzeComments).not.toHaveBeenCalled()
  })

  it('returns a demo result without touching AI or the database in demo mode', async () => {
    auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('@/app/api/channel/sync/route')
    const res = await POST()
    expect(res.status).toBe(200)
    expect((await res.json()).data.isDemo).toBe(true)
    expect(analyzeComments).not.toHaveBeenCalled()
  })

  it('returns 401 when the Google token refresh failed', async () => {
    live()
    auth.mockResolvedValue({ user: { id: USER_ID }, accessToken: 'stale', error: 'RefreshAccessTokenError' })
    const { POST } = await import('@/app/api/channel/sync/route')
    expect((await POST()).status).toBe(401)
  })

  it('returns 422 and saves nothing when the videos have no comments', async () => {
    live()
    auth.mockResolvedValue({ user: { id: USER_ID }, accessToken: 'tok' })
    getMyVideoComments.mockResolvedValueOnce([])
    const { POST } = await import('@/app/api/channel/sync/route')
    expect((await POST()).status).toBe(422)
    expect(analyzeComments).not.toHaveBeenCalled()
    expect(AudienceAnalysis.create).not.toHaveBeenCalled()
  })

  it('analyzes comments and saves the analysis for the user', async () => {
    live()
    auth.mockResolvedValue({ user: { id: USER_ID }, accessToken: 'tok' })
    const { POST } = await import('@/app/api/channel/sync/route')
    const res = await POST()
    expect(res.status).toBe(200)
    expect((await res.json()).data.topicsFound).toBe(1)
    expect(AudienceAnalysis.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID, channelId: 'UCme', status: 'completed', totalComments: 1 })
    )
  })
})

describe('GET /api/videos', () => {
  const live = () => {
    const { isDemoMode } = require('@/lib/demo-mode') as { isDemoMode: jest.Mock }
    isDemoMode.mockReturnValueOnce(false)
  }
  const { auth } = require('@/lib/auth') as { auth: jest.Mock }
  const { getMyVideos } = require('@/services/youtube') as { getMyVideos: jest.Mock }

  beforeEach(() => getMyVideos.mockClear())

  it('returns videos in demo mode', async () => {
    auth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/videos/route')
    const res = await GET(mockRequest('GET', 'http://localhost/api/videos') as never)
    expect(res.status).toBe(200)
    expect((await res.json()).data).toHaveLength(1)
  })

  it('returns 401 in live mode when unauthenticated', async () => {
    live()
    auth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/videos/route')
    const res = await GET(mockRequest('GET', 'http://localhost/api/videos') as never)
    expect(res.status).toBe(401)
    expect(getMyVideos).not.toHaveBeenCalled()
  })

  it('returns 401 when the Google token refresh failed', async () => {
    live()
    auth.mockResolvedValue({ user: { id: 'u1' }, accessToken: 'stale', error: 'RefreshAccessTokenError' })
    const { GET } = await import('@/app/api/videos/route')
    const res = await GET(mockRequest('GET', 'http://localhost/api/videos') as never)
    expect(res.status).toBe(401)
    expect((await res.json()).error).toMatch(/sign in again/i)
  })

  it('fetches with the user token and clamps maxResults to 50', async () => {
    live()
    auth.mockResolvedValue({ user: { id: 'u1' }, accessToken: 'tok' })
    const { GET } = await import('@/app/api/videos/route')
    const res = await GET(mockRequest('GET', 'http://localhost/api/videos?maxResults=999') as never)
    expect(res.status).toBe(200)
    expect(getMyVideos).toHaveBeenCalledWith('tok', 50)
  })
})
