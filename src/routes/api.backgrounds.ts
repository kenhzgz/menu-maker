import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

export const Route = createFileRoute('/api/backgrounds')({
  server: {
    handlers: {
      // Body is the raw image bytes (already resized on the device).
      POST: async ({ request }) => {
        const type = request.headers.get('content-type')?.split(';')[0] ?? ''
        if (!ALLOWED_TYPES.has(type)) {
          return Response.json({ error: 'Formato de imagen no admitido' }, { status: 415 })
        }
        const bytes = await request.arrayBuffer()
        if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
          return Response.json({ error: 'La imagen es demasiado grande' }, { status: 413 })
        }
        const key = crypto.randomUUID()
        await getStore('backgrounds').set(key, new Blob([bytes], { type }))
        return Response.json({ url: `/api/backgrounds/${key}` }, { status: 201 })
      },
    },
  },
})
