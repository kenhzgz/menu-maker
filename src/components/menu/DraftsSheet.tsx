import { useEffect, useState } from 'react'
import {
  Copy,
  FilePlus2,
  FolderOpen,
  Loader2,
  RotateCw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import type { Menu } from '@/lib/menu'
import { fetchDraftList } from '@/lib/use-draft'
import type { DraftSummary } from '@/lib/use-draft'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

import { MenuPreview } from './MenuPreview'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentId: string | null
  currentMenu: Menu | null
  onOpen: (id: string) => Promise<boolean>
  onNew: () => Promise<void>
  onDuplicate: (menu: Menu) => Promise<void>
  onDelete: (id: string, fallback?: string) => Promise<void>
}

const dateFormat = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dishCount = (menu: Menu) => {
  const n = menu.items.filter((i) => i.kind === 'dish').length
  return n === 1 ? '1 plato' : `${n} platos`
}

/** Lists every menu draft saved from this device, to open, copy or delete. */
export function DraftsSheet({
  open,
  onOpenChange,
  currentId,
  currentMenu,
  onOpen,
  onNew,
  onDuplicate,
  onDelete,
}: Props) {
  const [drafts, setDrafts] = useState<Array<DraftSummary> | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<DraftSummary | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetchDraftList()
      .then((list) => {
        if (cancelled) return
        setError(false)
        setDrafts(list)
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [open, reload])

  // The open menu always shows its live state, even before it is saved.
  const list: Array<DraftSummary> = drafts
    ? [
        ...(currentId && currentMenu
          ? [
              {
                id: currentId,
                menu: currentMenu,
                updatedAt:
                  drafts.find((d) => d.id === currentId)?.updatedAt ??
                  new Date().toISOString(),
              },
            ]
          : []),
        ...drafts.filter((d) => d.id !== currentId),
      ]
    : []

  const run = async (
    key: string,
    action: () => Promise<unknown>,
    failure: string,
  ) => {
    setBusy(key)
    try {
      await action()
      return true
    } catch {
      toast.error(failure)
      return false
    } finally {
      setBusy(null)
    }
  }

  const openOne = async (id: string) => {
    if (id === currentId) return onOpenChange(false)
    const ok = await run(
      id,
      async () => {
        if (!(await onOpen(id))) throw new Error('not found')
      },
      'No se pudo abrir el menú',
    )
    if (ok) onOpenChange(false)
  }

  const confirmDelete = async () => {
    const draft = toDelete
    if (!draft) return
    setToDelete(null)
    const fallback = list.find((d) => d.id !== draft.id)?.id
    const ok = await run(
      `del-${draft.id}`,
      () => onDelete(draft.id, fallback),
      'No se pudo eliminar',
    )
    if (ok) {
      setDrafts((prev) => prev?.filter((d) => d.id !== draft.id) ?? prev)
      toast.success('Menú eliminado')
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle className="font-display text-2xl font-extrabold">
              Mis menús
            </SheetTitle>
            <SheetDescription>
              Todos tus borradores se guardan solos. Abre uno para seguir
              editándolo.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pt-4">
            <Button
              type="button"
              className="h-12 w-full rounded-2xl"
              disabled={busy !== null}
              onClick={() =>
                run('new', onNew, 'No se pudo crear el menú').then(
                  (ok) =>
                    ok &&
                    (onOpenChange(false), toast.success('Nuevo menú creado')),
                )
              }
            >
              {busy === 'new' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FilePlus2 />
              )}
              Nuevo menú
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-medium text-destructive">
                  No se pudieron cargar tus menús.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setError(false)
                    setReload((r) => r + 1)
                  }}
                >
                  <RotateCw /> Reintentar
                </Button>
              </div>
            ) : !drafts ? (
              <ul className="space-y-3" aria-label="Cargando menús">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex gap-3 rounded-2xl border p-3">
                    <Skeleton className="h-24 w-16 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : list.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aún no tienes menús guardados.
              </p>
            ) : (
              <ul className="space-y-3">
                {list.map((d) => {
                  const isCurrent = d.id === currentId
                  return (
                    <li
                      key={d.id}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors',
                        isCurrent && 'border-primary ring-1 ring-primary',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openOne(d.id)}
                        disabled={busy !== null}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-ring"
                        aria-label={`Abrir ${d.menu.title || 'menú sin título'}`}
                      >
                        <div className="h-24 w-16 shrink-0">
                          <MenuPreview menu={d.menu} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-semibold">
                              {d.menu.title || 'Sin título'}
                            </span>
                            {busy === d.id ? (
                              <Loader2 className="size-4 shrink-0 animate-spin" />
                            ) : null}
                          </div>
                          {d.menu.subtitle ? (
                            <div className="truncate text-sm text-muted-foreground">
                              {d.menu.subtitle}
                            </div>
                          ) : null}
                          <div className="mt-1 text-xs text-muted-foreground">
                            {dishCount(d.menu)} ·{' '}
                            {isCurrent
                              ? 'Abierto ahora'
                              : dateFormat.format(new Date(d.updatedAt))}
                          </div>
                        </div>
                      </button>
                      <div className="flex shrink-0 flex-col gap-1">
                        {!isCurrent ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Abrir ${d.menu.title}`}
                            disabled={busy !== null}
                            onClick={() => openOne(d.id)}
                          >
                            <FolderOpen />
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Duplicar ${d.menu.title}`}
                          disabled={busy !== null}
                          onClick={() =>
                            run(
                              `dup-${d.id}`,
                              () => onDuplicate(d.menu),
                              'No se pudo duplicar',
                            ).then(
                              (ok) =>
                                ok &&
                                (onOpenChange(false),
                                toast.success('Copia creada')),
                            )
                          }
                        >
                          <Copy />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Eliminar ${d.menu.title}`}
                          disabled={busy !== null}
                          onClick={() => setToDelete(d)}
                        >
                          {busy === `del-${d.id}` ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Eliminar «{toDelete?.menu.title || 'Sin título'}»?
            </DialogTitle>
            <DialogDescription>
              El borrador se borrará para siempre. Las imágenes que ya guardaste
              en la galería no se tocan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
