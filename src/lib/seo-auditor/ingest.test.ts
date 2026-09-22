import { describe, expect, it, vi } from 'vitest'
import { ingestPage } from './ingest'

describe('ingestPage', () => {
  it('fetches an HTML page with a bounded request and records the final URL', async () => {
    const fetcher = vi.fn(() =>
      Promise.resolve(
        new Response('<html><body>Hello</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        }),
      ),
    )

    const page = await ingestPage('https://example.com/start', { fetcher })

    expect(page).toMatchObject({
      requestedUrl: 'https://example.com/start',
      status: 200,
      html: '<html><body>Hello</body></html>',
    })
    expect(fetcher).toHaveBeenCalledWith(
      'https://example.com/start',
      expect.objectContaining({
        redirect: 'follow',
        headers: expect.objectContaining({
          accept: expect.stringContaining('text/html'),
        }),
      }),
    )
  })

  it('rejects unsupported schemes and non-HTML responses', async () => {
    await expect(ingestPage('file:///etc/passwd')).rejects.toThrow(
      'Only http: and https: URLs are supported',
    )

    await expect(
      ingestPage('https://example.com/data', {
        fetcher: () =>
          Promise.resolve(
            new Response('{}', {
              status: 200,
              headers: { 'content-type': 'application/json' },
            }),
          ),
      }),
    ).rejects.toThrow('Expected an HTML response')
  })

  it('rejects oversized pages before analysis', async () => {
    await expect(
      ingestPage('https://example.com/large', {
        maxBytes: 10,
        fetcher: () =>
          Promise.resolve(
            new Response('01234567890', {
              status: 200,
              headers: { 'content-type': 'text/html' },
            }),
          ),
      }),
    ).rejects.toThrow('exceeds the 10 byte limit')
  })

  it('cancels a streamed response as soon as it exceeds the byte limit', async () => {
    let cancelled = false
    let chunksRead = 0
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        chunksRead += 1
        controller.enqueue(new TextEncoder().encode('123456'))
        if (chunksRead === 3) controller.close()
      },
      cancel() {
        cancelled = true
      },
    })

    await expect(
      ingestPage('https://example.com/stream', {
        maxBytes: 5,
        fetcher: () =>
          Promise.resolve(
            new Response(body, {
              status: 200,
              headers: { 'content-type': 'text/html' },
            }),
          ),
      }),
    ).rejects.toThrow('exceeds the 5 byte limit')

    expect(cancelled).toBe(true)
    expect(chunksRead).toBeLessThan(3)
  })
})
