import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../db/index.js'
import { menuDrafts } from '../../db/schema.js'

const draftId = z.uuid()
const MAX_DRAFT_BYTES = 256 * 1024

export const Route = createFileRoute('/api/drafts/$draftId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!draftId.safeParse(params.draftId).success) {
          return Response.json({ error: 'Borrador no válido' }, { status: 400 })
        }
        const [row] = await db
          .select()
          .from(menuDrafts)
          .where(eq(menuDrafts.id, params.draftId))
        if (!row)
          return Response.json({ error: 'No encontrado' }, { status: 404 })
        return Response.json({ data: row.data, updatedAt: row.updatedAt })
      },
      PUT: async ({ params, request }) => {
        if (!draftId.safeParse(params.draftId).success) {
          return Response.json({ error: 'Borrador no válido' }, { status: 400 })
        }
        const raw = await request.text()
        if (raw.length > MAX_DRAFT_BYTES) {
          return Response.json(
            { error: 'Borrador demasiado grande' },
            { status: 413 },
          )
        }
        let data: unknown
        try {
          data = JSON.parse(raw)
        } catch {
          return Response.json({ error: 'JSON no válido' }, { status: 400 })
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          return Response.json({ error: 'Formato no válido' }, { status: 400 })
        }
        const now = new Date()
        await db
          .insert(menuDrafts)
          .values({ id: params.draftId, data, updatedAt: now })
          .onConflictDoUpdate({
            target: menuDrafts.id,
            set: { data, updatedAt: now },
          })
        return Response.json({ ok: true, updatedAt: now })
      },
      DELETE: async ({ params }) => {
        if (!draftId.safeParse(params.draftId).success) {
          return Response.json({ error: 'Borrador no válido' }, { status: 400 })
        }
        await db.delete(menuDrafts).where(eq(menuDrafts.id, params.draftId))
        return Response.json({ ok: true })
      },
    },
  },
})
