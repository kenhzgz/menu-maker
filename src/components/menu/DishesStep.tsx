import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  MessageSquareText,
  Plus,
  Rows3,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { dish, formatPrice, section } from '@/lib/menu'
import type { Menu, MenuItem } from '@/lib/menu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { SectionTitle } from './controls'

type Props = {
  menu: Menu
  setMenu: (update: (prev: Menu) => Menu) => void
}

/** "Croquetas 8.50" → dish, "Postres:" → section. One entry per line. */
export function parseList(text: string): Array<MenuItem> {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.endsWith(':')) return section(line.slice(0, -1).trim())
      const match = line.match(/^(.*?)[\s.\-–—·|]*([$€£]?\s?\d+(?:[.,]\d{1,2})?\s?[$€£]?)$/)
      if (match && match[1]) {
        const price = match[2].replace(/[$€£\s]/g, '')
        return dish(match[1].trim(), price)
      }
      return dish(line, '')
    })
}

export function DishesStep({ menu, setMenu }: Props) {
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set())
  const [focusId, setFocusId] = useState<string | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')

  const update = (id: string, patch: Partial<MenuItem>) =>
    setMenu((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))

  const remove = (id: string) =>
    setMenu((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }))

  const move = (index: number, dir: -1 | 1) =>
    setMenu((prev) => {
      const items = [...prev.items]
      const target = index + dir
      if (target < 0 || target >= items.length) return prev
      ;[items[index], items[target]] = [items[target], items[index]]
      return { ...prev, items }
    })

  const add = (item: MenuItem) => {
    setMenu((prev) => ({ ...prev, items: [...prev.items, item] }))
    setFocusId(item.id)
  }

  const toggleNote = (id: string) =>
    setOpenNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const addBulk = () => {
    const items = parseList(bulkText)
    if (!items.length) return
    setMenu((prev) => ({ ...prev, items: [...prev.items, ...items] }))
    setBulkText('')
    setBulkOpen(false)
    toast.success(`${items.length} elementos añadidos`)
  }

  const dishCount = menu.items.filter((i) => i.kind === 'dish').length

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionTitle>Encabezado</SectionTitle>
        <Field label="Nombre del restaurante o del menú">
          <Input
            value={menu.title}
            placeholder="La Cocina"
            onChange={(e) => setMenu((p) => ({ ...p, title: e.target.value }))}
            className="h-11 text-base"
          />
        </Field>
        <Field label="Subtítulo">
          <Input
            value={menu.subtitle}
            placeholder="Menú del día"
            onChange={(e) => setMenu((p) => ({ ...p, subtitle: e.target.value }))}
            className="h-11 text-base"
          />
        </Field>
        <Field label="Pie de página">
          <Input
            value={menu.footer}
            placeholder="Dirección, teléfono, horario…"
            onChange={(e) => setMenu((p) => ({ ...p, footer: e.target.value }))}
            className="h-11 text-base"
          />
        </Field>
      </section>

      <section>
        <SectionTitle hint={`${dishCount} ${dishCount === 1 ? 'plato' : 'platos'}`}>
          Platos
        </SectionTitle>

        {menu.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Tu menú está vacío. Añade tu primer plato.
          </div>
        ) : null}

        <ol className="space-y-2">
          {menu.items.map((item, index) => {
            const isSection = item.kind === 'section'
            const noteOpen = openNotes.has(item.id) || Boolean(item.description)
            return (
              <li
                key={item.id}
                className={cn(
                  'rounded-2xl border bg-card p-2 shadow-xs',
                  isSection && 'mt-5 border-primary/30 bg-primary/5',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Subir"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="flex h-5 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-25"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar"
                      onClick={() => move(index, 1)}
                      disabled={index === menu.items.length - 1}
                      className="flex h-5 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-25"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>

                  {isSection ? (
                    <input
                      value={item.name}
                      autoFocus={focusId === item.id}
                      placeholder="Nombre de la sección"
                      aria-label="Nombre de la sección"
                      onChange={(e) => update(item.id, { name: e.target.value })}
                      className="h-10 min-w-0 flex-1 rounded-lg bg-transparent px-2 font-display text-base font-semibold uppercase tracking-wider text-primary outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-primary/40 focus:bg-card"
                    />
                  ) : (
                    <>
                      <input
                        value={item.name}
                        autoFocus={focusId === item.id}
                        placeholder="Nombre del plato"
                        aria-label="Nombre del plato"
                        onChange={(e) => update(item.id, { name: e.target.value })}
                        className="h-10 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-base outline-none focus:bg-muted/60"
                      />
                      <span
                        aria-hidden
                        className="hidden h-px flex-[0.3] border-b border-dotted border-muted-foreground/40 sm:block"
                      />
                      <input
                        value={item.price}
                        inputMode="decimal"
                        placeholder={formatPrice('0', menu.style) || '0'}
                        aria-label="Precio"
                        onChange={(e) => update(item.id, { price: e.target.value })}
                        className="h-10 w-20 shrink-0 rounded-lg bg-muted/60 px-2 text-right text-base font-semibold tabular-nums outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </>
                  )}

                  {!isSection ? (
                    <button
                      type="button"
                      aria-label="Descripción"
                      aria-pressed={noteOpen}
                      onClick={() => toggleNote(item.id)}
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted',
                        noteOpen && 'text-primary',
                      )}
                    >
                      <MessageSquareText className="size-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Eliminar"
                    onClick={() => remove(item.id)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {!isSection && noteOpen ? (
                  <input
                    value={item.description}
                    placeholder="Descripción corta (opcional)"
                    aria-label="Descripción"
                    onChange={(e) => update(item.id, { description: e.target.value })}
                    className="ml-9 mt-1 h-9 w-[calc(100%-2.25rem)] rounded-lg bg-muted/50 px-2 text-sm italic outline-none focus:ring-2 focus:ring-primary/30"
                  />
                ) : null}
              </li>
            )
          })}
        </ol>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" size="lg" className="h-12" onClick={() => add(dish())}>
            <Plus /> Añadir plato
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12"
            onClick={() => add(section())}
          >
            <Rows3 /> Añadir sección
          </Button>
        </div>

        <div className="mt-3 rounded-2xl border bg-card">
          <button
            type="button"
            onClick={() => setBulkOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium"
          >
            <ClipboardList className="size-4 text-primary" />
            Pegar varios platos a la vez
          </button>
          {bulkOpen ? (
            <div className="space-y-2 px-4 pb-4">
              <p className="text-xs text-muted-foreground">
                Un plato por línea con su precio al final. Termina una línea con «:» para
                crear una sección.
              </p>
              <Textarea
                rows={5}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={'Bebidas:\nLimonada 3.50\nCafé 2'}
                className="text-base"
              />
              <Button type="button" onClick={addBulk} disabled={!bulkText.trim()}>
                Añadir a la lista
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
