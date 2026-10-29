/**
 * The AI factory must never fall back to demo output in live mode:
 * that would save fake topics as a creator's real audience analysis.
 */
describe('getAIProvider', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })
  afterAll(() => {
    process.env = env
  })

  it('throws in live mode when GEMINI_API_KEY is missing', async () => {
    process.env.DEMO_MODE = 'false'
    delete process.env.GEMINI_API_KEY
    const { getAIProvider } = await import('@/services/ai')
    expect(() => getAIProvider()).toThrow(/GEMINI_API_KEY/)
  })

  it('uses demo output in demo mode even without a key', async () => {
    process.env.DEMO_MODE = 'true'
    delete process.env.GEMINI_API_KEY
    const { getAIProvider } = await import('@/services/ai')
    const result = await getAIProvider().analyzeComments([], 'Any')
    expect(result.topics.length).toBeGreaterThan(0)
  })
})
