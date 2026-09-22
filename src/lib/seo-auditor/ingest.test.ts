import { describe, expect, it, vi } from 'vitest'
import { ingestPage } from './ingest'

const publicResolver = () => Promise.resolve(['93.184.216.34'])

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

    const page = await ingestPage('https://example.com/start', {
      fetcher,
      resolveHost: publicResolver,
    })

    expect(page).toMatchObject({
      requestedUrl: 'https://example.com/start',
      status: 200,
      html: '<html><body>Hello</body></html>',
    })
    expect(fetcher).toHaveBeenCalledWith(
      'https://example.com/start',
      expect.objectContaining({
        dispatcher: expect.anything(),
        redirect: 'manual',
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
        resolveHost: publicResolver,
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
        resolveHost: publicResolver,
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
        resolveHost: publicResolver,
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

  it('rejects private literal and resolved addresses by default', async () => {
    const fetcher = vi.fn()

    await expect(
      ingestPage('http://127.0.0.1/admin', { fetcher }),
    ).rejects.toThrow('non-public address')
    await expect(
      ingestPage('https://internal.example/admin', {
        fetcher,
        resolveHost: () => Promise.resolve(['10.0.0.8']),
      }),
    ).rejects.toThrow('non-public address')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('validates every redirect target before fetching it', async () => {
    const fetcher = vi.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 302,
          headers: { location: 'http://169.254.169.254/latest/meta-data' },
        }),
      ),
    )

    await expect(
      ingestPage('https://example.com/start', {
        fetcher,
        resolveHost: publicResolver,
      }),
    ).rejects.toThrow('non-public address')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('allows private addresses only through explicit opt-in', async () => {
    const page = await ingestPage('http://127.0.0.1/page', {
      allowPrivateHosts: true,
      fetcher: () =>
        Promise.resolve(
          new Response('<html></html>', {
            status: 200,
            headers: { 'content-type': 'text/html' },
          }),
        ),
    })

    expect(page.finalUrl).toBe('http://127.0.0.1/page')
  })
})
