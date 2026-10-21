import { useEffect, useState } from 'react'
import { Download, FilePlus2, Files, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { FORMATS } from '@/lib/menu'
import type { Menu } from '@/lib/menu'
import { exportMenu } from '@/lib/render-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { SectionTitle, Segmented } from './controls'

type Props = {
  menu: Menu
  onNew: () => void
  onShowDrafts: () => void
}

const fileName = (menu: Menu) =>
  `menu-${
    menu.title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'restaurante'
  }.jpg`

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function ExportStep({ menu, onNew, onShowDrafts }: Props) {
  const [quality, setQuality] = useState<1 | 2 | 3>(2)
  const [busy, setBusy] = useState<'share' | 'download' | null>(null)

  const fmt = FORMATS[menu.style.format]
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    'canShare' in navigator &&
    navigator.canShare({
      files: [new File([], 'x.jpg', { type: 'image/jpeg' })],
    })

  // Render ahead of time so sharing happens right on the tap; iOS Safari
  // refuses navigator.share() once the gesture has gone stale.
  const [prepared, setPrepared] = useState<{ key: string; blob: Blob } | null>(
    null,
  )
  const key = JSON.stringify([menu, quality])
  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      exportMenu(menu, quality)
        .then((blob) => !cancelled && setPrepared({ key, blob }))
        .catch(() => null)
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const saveToGallery = async () => {
    setBusy('share')
    try {
      const blob =
        prepared?.key === key ? prepared.blob : await exportMenu(menu, quality)
      const file = new File([blob], fileName(menu), { type: 'image/jpeg' })
      if (canShareFiles && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: menu.title })
          return
        } catch (err) {
          if ((err as Error).name === 'AbortError') return
        }
      }
      download(blob, file.name)
      toast.success('Imagen descargada', {
        description: 'La encontrarás en tus descargas y en la galería.',
      })
    } catch {
      toast.error('No se pudo crear la imagen')
    } finally {
      setBusy(null)
    }
  }

  const saveFile = async () => {
    setBusy('download')
    try {
      const blob =
        prepared?.key === key ? prepared.blob : await exportMenu(menu, quality)
      download(blob, fileName(menu))
      toast.success('Imagen descargada')
    } catch {
      toast.error('No se pudo crear la imagen')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle>¿Te gusta cómo quedó?</SectionTitle>
        <p className="-mt-1 text-sm text-muted-foreground">
          Guarda tu menú como imagen. En el móvil se abre el menú de compartir:
          elige <b>«Guardar imagen»</b> para que aparezca en tu galería.
        </p>

        <Segmented
          label="Calidad"
          value={quality}
          onChange={setQuality}
          options={[
            { value: 1, label: 'Redes' },
            { value: 2, label: 'Alta' },
            { value: 3, label: 'Imprimir' },
          ]}
        />
        <p className="text-xs text-muted-foreground">
          {fmt.width * quality} × {fmt.height * quality} px · {fmt.label}
        </p>

        <div className="mt-5 space-y-2">
          <Button
            type="button"
            size="lg"
            className="h-14 w-full rounded-2xl text-base shadow-lg shadow-primary/25"
            onClick={saveToGallery}
            disabled={busy !== null}
          >
            {busy === 'share' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Share2 />
            )}
            Guardar en la galería
          </Button>
          {canShareFiles ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-2xl"
              onClick={saveFile}
              disabled={busy !== null}
            >
              {busy === 'download' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}
              Descargar archivo
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h3 className="font-semibold">Tu borrador está a salvo</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada cambio se guarda automáticamente. Puedes tener todos los menús
          que quieras: encuéntralos en «Mis menús» para seguir editándolos
          cuando quieras.
        </p>
        <div className="mt-3 -ml-2 flex flex-wrap gap-1">
          <Button type="button" variant="ghost" onClick={onShowDrafts}>
            <Files /> Mis menús
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost">
                <FilePlus2 /> Empezar un menú nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Empezar un menú nuevo?</DialogTitle>
                <DialogDescription>
                  Se creará un borrador nuevo desde cero. Este menú seguirá
                  guardado en «Mis menús».
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={onNew}>Empezar de nuevo</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  )
}
