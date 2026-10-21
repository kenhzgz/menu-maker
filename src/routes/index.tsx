import { useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  CloudOff,
  Files,
  Loader2,
  Maximize2,
  Minimize2,
  Share2,
} from 'lucide-react'

import { useDraft } from '@/lib/use-draft'
import type { SaveStatus } from '@/lib/use-draft'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MenuPreview } from '@/components/menu/MenuPreview'
import { BackgroundStep } from '@/components/menu/BackgroundStep'
import { DishesStep } from '@/components/menu/DishesStep'
import { StyleStep } from '@/components/menu/StyleStep'
import { ExportStep } from '@/components/menu/ExportStep'
import { DraftsSheet } from '@/components/menu/DraftsSheet'

export const Route = createFileRoute('/')({
  component: Editor,
})

const STEPS = [
  { id: 'fondo', label: 'Fondo', title: 'Elige el fondo' },
  { id: 'platos', label: 'Platos', title: 'Añade tus platos' },
  { id: 'estilo', label: 'Estilo', title: 'Dale tu estilo' },
  { id: 'guardar', label: 'Guardar', title: 'Guarda tu menú' },
] as const

function Editor() {
  const {
    menu,
    setMenu,
    status,
    currentId,
    startNew,
    openDraft,
    duplicateDraft,
    deleteDraft,
    retry,
  } = useDraft()
  const [step, setStep] = useState(0)
  const [draftsOpen, setDraftsOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)

  const goTo = (index: number) => {
    setStep(index)
    controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-8 lg:pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-foreground font-display text-lg font-extrabold italic text-background">
            C
          </span>
          <div className="leading-tight">
            <div className="font-display text-xl font-extrabold tracking-tight">
              Carta
            </div>
            <div className="hidden text-xs text-muted-foreground sm:block">
              El menú de tu restaurante, desde el móvil
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SaveBadge status={status} onRetry={retry} />
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => setDraftsOpen(true)}
            disabled={!menu}
            aria-label="Mis menús"
          >
            <Files /> <span className="hidden sm:inline">Mis menús</span>
          </Button>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => goTo(3)}
            disabled={!menu}
          >
            <Share2 /> <span className="hidden sm:inline">Guardar imagen</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:gap-12 lg:px-8 lg:pb-16">
        {/* Preview: sticky on top on phones, sticky column on desktop */}
        <div
          className={cn(
            'sticky top-0 z-20 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md transition-[height] duration-300 lg:order-2 lg:top-6 lg:h-[calc(100svh-6rem)] lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
            compact ? 'h-[22svh]' : 'h-[46svh]',
          )}
        >
          <div className="relative h-full">
            {menu ? (
              <MenuPreview menu={menu} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="aspect-[9/16] h-full rounded-[14px]" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setCompact((c) => !c)}
              aria-label={
                compact ? 'Agrandar vista previa' : 'Reducir vista previa'
              }
              className="absolute bottom-1 right-0 flex size-9 items-center justify-center rounded-full border bg-card/90 text-muted-foreground shadow-sm lg:hidden"
            >
              {compact ? (
                <Maximize2 className="size-4" />
              ) : (
                <Minimize2 className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div
          ref={controlsRef}
          className="scroll-mt-[47svh] px-4 pb-28 pt-5 lg:scroll-mt-6 lg:px-0 lg:pt-4"
        >
          <nav aria-label="Pasos" className="mb-6">
            <ol className="grid grid-cols-4 gap-1.5 rounded-2xl bg-muted p-1.5">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={step === i ? 'step' : undefined}
                    className={cn(
                      'flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold transition sm:flex-row sm:justify-center sm:gap-2 sm:text-sm',
                      step === i
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-[11px]',
                        step === i
                          ? 'bg-primary text-primary-foreground'
                          : i < step
                            ? 'bg-foreground/80 text-background'
                            : 'bg-background text-muted-foreground',
                      )}
                    >
                      {i < step ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="mb-5 font-display text-3xl font-extrabold tracking-tight lg:text-4xl">
            {STEPS[step].title}
          </h1>

          {!menu ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : (
            <>
              {step === 0 && <BackgroundStep menu={menu} setMenu={setMenu} />}
              {step === 1 && <DishesStep menu={menu} setMenu={setMenu} />}
              {step === 2 && <StyleStep menu={menu} setMenu={setMenu} />}
              {step === 3 && (
                <ExportStep
                  menu={menu}
                  onNew={async () => {
                    await startNew()
                    goTo(0)
                  }}
                  onShowDrafts={() => setDraftsOpen(true)}
                />
              )}

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="mt-10 h-12 w-full rounded-2xl text-base"
                  onClick={() => goTo(step + 1)}
                >
                  Siguiente: {STEPS[step + 1].label} <ArrowRight />
                </Button>
              ) : null}
            </>
          )}
        </div>
      </main>

      <DraftsSheet
        open={draftsOpen}
        onOpenChange={setDraftsOpen}
        currentId={currentId}
        currentMenu={menu}
        onOpen={async (id) => {
          const ok = await openDraft(id)
          if (ok) goTo(1)
          return ok
        }}
        onNew={async () => {
          await startNew()
          goTo(0)
        }}
        onDuplicate={duplicateDraft}
        onDelete={deleteDraft}
      />
    </div>
  )
}

function SaveBadge({
  status,
  onRetry,
}: {
  status: SaveStatus
  onRetry: () => void
}) {
  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
      >
        <CloudOff className="size-3.5" /> Sin guardar · Reintentar
      </button>
    )
  }
  return (
    <span
      className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border"
      aria-live="polite"
    >
      {status === 'saved' ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Loader2 className="size-3.5 animate-spin" />
      )}
      {status === 'loading'
        ? 'Cargando…'
        : status === 'saving'
          ? 'Guardando…'
          : 'Borrador guardado'}
    </span>
  )
}
