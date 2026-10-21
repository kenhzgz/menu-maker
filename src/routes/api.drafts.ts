import { createFileRoute } from '@tanstack/react-router'
import { desc, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../db/index.js'
import { menuDrafts } from '../../db/schema.js'

// The device sends the draft ids it knows about; there are no accounts, so
// the ids themselves are the access keys.
const listBody = z.object({ ids: z.array(z.uuid()).max(200) })

export const Route = createFileRoute('/api/drafts')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'JSON no válido' }, { status: 400 })
        }
        const parsed = listBody.safeParse(body)
        if (!parsed.success) {
          return Response.json({ error: 'Lista no válida' }, { status: 400 })
        }
        if (parsed.data.ids.length === 0) return Response.json({ drafts: [] })
        const rows = await db
          .select()
          .from(menuDrafts)
          .where(inArray(menuDrafts.id, parsed.data.ids))
          .orderBy(desc(menuDrafts.updatedAt))
        return Response.json({
          drafts: rows.map((r) => ({
            id: r.id,
            data: r.data,
            updatedAt: r.updatedAt,
          })),
        })
      },
    },
  },
})
