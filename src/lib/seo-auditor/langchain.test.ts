import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLangChainSeoAnalyzer } from './langchain'

describe('createLangChainSeoAnalyzer', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('requires an explicit API key before creating the LLM analyzer', () => {
    vi.stubEnv('OPENAI_API_KEY', '')

    expect(() => createLangChainSeoAnalyzer()).toThrow(
      'OPENAI_API_KEY is required when LLM analysis is enabled',
    )
  })

  it('can be configured without making a network request', () => {
    const analyzer = createLangChainSeoAnalyzer({
      apiKey: 'test-key',
      baseUrl: 'http://127.0.0.1:9999/v1',
      model: 'test-model',
    })

    expect(analyzer).toEqual(expect.any(Function))
  })
})
