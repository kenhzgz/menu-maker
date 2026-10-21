import { useCallback, useEffect, useRef, useState } from 'react'

import { createDefaultMenu, newId, normalizeMenu } from './menu'
import type { Menu } from './menu'

const DRAFT_KEY = 'carta:draft-id'
const DRAFT_LIST_KEY = 'carta:draft-ids'
const SAVE_DELAY = 700

export type SaveStatus = 'loading' | 'saving' | 'saved' | 'error'

export type DraftSummary = { id: string; menu: Menu; updatedAt: string }

/** Ids of every draft created on this device, newest first. */
export function readDraftIds(): Array<string> {
  try {
    const raw = JSON.parse(
      localStorage.getItem(DRAFT_LIST_KEY) ?? '[]',
    ) as unknown
    const ids = Array.isArray(raw)
      ? raw.filter((x): x is string => typeof x === 'string')
      : []
    // Drafts created before the list existed only had the single current id.
    const current = localStorage.getItem(DRAFT_KEY)
    if (current && !ids.includes(current)) ids.unshift(current)
    return ids
  } catch {
    return []
  }
}

function writeDraftIds(ids: Array<string>) {
  localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(ids))
}

function rememberDraft(id: string) {
  localStorage.setItem(DRAFT_KEY, id)
  writeDraftIds([id, ...readDraftIds().filter((x) => x !== id)])
}

function forgetDraft(id: string) {
  writeDraftIds(readDraftIds().filter((x) => x !== id))
  if (localStorage.getItem(DRAFT_KEY) === id) localStorage.removeItem(DRAFT_KEY)
}

async function saveDraft(id: string, menu: Menu) {
  const res = await fetch(`/api/drafts/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(menu),
    keepalive: true,
  })
  if (!res.ok) throw new Error('save failed')
}

async function fetchDraft(id: string): Promise<Menu | null> {
  const res = await fetch(`/api/drafts/${id}`)
  if (!res.ok) return null
  const body = (await res.json()) as { data: unknown }
  return normalizeMenu(body.data)
}

/** Loads the saved drafts this device knows about, newest first. */
export async function fetchDraftList(): Promise<Array<DraftSummary>> {
  const res = await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids: readDraftIds() }),
  })
  if (!res.ok) throw new Error('list failed')
  const body = (await res.json()) as {
    drafts: Array<{ id: string; data: unknown; updatedAt: string }>
  }
  return body.drafts.map((d) => ({
    id: d.id,
    menu: normalizeMenu(d.data),
    updatedAt: d.updatedAt,
  }))
}

/**
 * Keeps the open menu in sync with its draft in Netlify Database. The device
 * only remembers the draft ids; every change is autosaved shortly after it
 * happens, and any number of drafts can be kept and reopened.
 */
export function useDraft() {
  const [menu, setMenuState] = useState<Menu | null>(null)
  const [status, setStatus] = useState<SaveStatus>('loading')
  const [currentId, setCurrentId] = useState<string | null>(null)
  const draftId = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<{ id: string; menu: Menu } | null>(null)

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const next = pending.current
    if (!next) return
    pending.current = null
    setStatus('saving')
    try {
      await saveDraft(next.id, next.menu)
      setStatus(pending.current ? 'saving' : 'saved')
    } catch {
      pending.current ??= next
      setStatus('error')
      throw new Error('save failed')
    }
  }, [])

  const schedule = useCallback(
    (next: Menu) => {
      const id = draftId.current
      if (!id) return
      pending.current = { id, menu: next }
      setStatus('saving')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => flush().catch(() => null), SAVE_DELAY)
    },
    [flush],
  )

  const show = useCallback((id: string, next: Menu) => {
    rememberDraft(id)
    draftId.current = id
    setCurrentId(id)
    setMenuState(next)
  }, [])

  const createFrom = useCallback(
    (next: Menu) => {
      show(newId(), next)
      schedule(next)
    },
    [show, schedule],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (stored) {
        try {
          const saved = await fetchDraft(stored)
          if (cancelled) return
          if (saved) {
            show(stored, saved)
            setStatus('saved')
            return
          }
        } catch {
          // fall through to a fresh draft
        }
      }
      if (cancelled) return
      createFrom(createDefaultMenu())
    }
    load()
    return () => {
      cancelled = true
    }
  }, [show, createFrom])

  // Save whatever is pending when the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && pending.current)
        flush().catch(() => null)
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [flush])

  const setMenu = useCallback(
    (update: (prev: Menu) => Menu) => {
      setMenuState((prev) => {
        if (!prev) return prev
        const next = update(prev)
        schedule(next)
        return next
      })
    },
    [schedule],
  )

  /** Saves the open menu first, then starts a blank one. */
  const startNew = useCallback(async () => {
    await flush().catch(() => null)
    createFrom(createDefaultMenu())
  }, [flush, createFrom])

  /** Saves the open menu first, then opens another saved draft. */
  const openDraft = useCallback(
    async (id: string) => {
      if (id === draftId.current) return true
      await flush().catch(() => null)
      const saved = await fetchDraft(id).catch(() => null)
      if (!saved) return false
      show(id, saved)
      setStatus('saved')
      return true
    },
    [flush, show],
  )

  /** Creates a new draft that starts as a copy of `source`, and opens it. */
  const duplicateDraft = useCallback(
    async (source: Menu) => {
      await flush().catch(() => null)
      createFrom({ ...source, title: `${source.title} (copia)` })
    },
    [flush, createFrom],
  )

  /** Deletes a draft. If it was the open one, opens the next or a blank menu. */
  const deleteDraft = useCallback(
    async (id: string, fallback?: string) => {
      const res = await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      forgetDraft(id)
      if (id !== draftId.current) return
      if (pending.current?.id === id) pending.current = null
      if (timer.current) clearTimeout(timer.current)
      const saved = fallback
        ? await fetchDraft(fallback).catch(() => null)
        : null
      if (fallback && saved) {
        show(fallback, saved)
        setStatus('saved')
      } else {
        createFrom(createDefaultMenu())
      }
    },
    [show, createFrom],
  )

  const retry = useCallback(() => {
    if (pending.current) flush().catch(() => null)
  }, [flush])

  return {
    menu,
    setMenu,
    status,
    currentId,
    startNew,
    openDraft,
    duplicateDraft,
    deleteDraft,
    retry,
  }
}
