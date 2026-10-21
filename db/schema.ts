import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// One row per menu draft. The id is a random UUID kept on the device, and
// `data` holds the whole editor state (dishes, styles, chosen background).
export const menuDrafts = pgTable('menu_drafts', {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
