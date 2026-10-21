import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'

export const Route = createFileRoute('/api/backgrounds/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!/^[0-9a-f-]{36}$/.test(params.key)) {
          return new Response('Not found', { status: 404 })
        }
        const blob = await getStore('backgrounds').get(params.key, { type: 'blob' })
        if (!blob) return new Response('Not found', { status: 404 })
        return new Response(blob, {
          headers: {
            'content-type': blob.type || 'image/jpeg',
            'cache-control': 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
