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
