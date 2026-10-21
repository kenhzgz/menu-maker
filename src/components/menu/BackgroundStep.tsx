import { useRef, useState } from 'react'
import { Check, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import {
  DARK_STYLE,
  LIGHT_STYLE,
  PRESET_BACKGROUNDS,
  SOLID_BACKGROUNDS,
  cdnImage,
} from '@/lib/menu'
import type { Background, Menu } from '@/lib/menu'
import { uploadImage } from '@/lib/upload-image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { SectionTitle, SliderField } from './controls'

type Props = {
  menu: Menu
  setMenu: (update: (prev: Menu) => Menu) => void
}

const isDarkColor = (hex: string) => {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b < 140
}

export function BackgroundStep({ menu, setMenu }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<'bg' | 'logo' | null>(null)

  // Switch to a readable palette when the new background flips light/dark.
  const choose = (background: Background, darkBackground?: boolean) =>
    setMenu((prev) => {
      let style = prev.style
      if (darkBackground !== undefined) {
        const textIsDark = isDarkColor(prev.style.textColor)
        if (darkBackground && textIsDark) style = { ...style, ...DARK_STYLE }
        if (!darkBackground && !textIsDark) style = { ...style, ...LIGHT_STYLE }
      }
      return { ...prev, background, style }
    })

  const onFile = async (file: File | undefined, kind: 'bg' | 'logo') => {
    if (!file) return
    setUploading(kind)
    try {
      const url = await uploadImage(file, kind === 'logo' ? { maxSize: 800, keepAlpha: true } : {})
      if (kind === 'bg') {
        setMenu((prev) => ({ ...prev, background: { type: 'upload', url } }))
        toast.success('Fondo listo')
      } else {
        setMenu((prev) => ({ ...prev, logoUrl: url }))
        toast.success('Logo añadido')
      }
    } catch {
      toast.error('No se pudo subir la imagen. Inténtalo de nuevo.')
    } finally {
      setUploading(null)
      if (fileRef.current) fileRef.current.value = ''
      if (logoRef.current) logoRef.current.value = ''
    }
  }

  const bg = menu.background
  const s = menu.style

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle hint="Desde tu galería o cámara">Tu foto</SectionTitle>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0], 'bg')}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading === 'bg'}
          className={cn(
            'group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-left transition',
            bg.type === 'upload'
              ? 'border-primary bg-primary/5'
              : 'border-input hover:border-primary/60 hover:bg-card',
          )}
        >
          {bg.type === 'upload' ? (
            <img
              src={bg.url}
              alt=""
              className="h-20 w-14 shrink-0 rounded-lg object-cover shadow"
            />
          ) : (
            <span className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              {uploading === 'bg' ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <ImagePlus className="size-6" />
              )}
            </span>
          )}
          <span className="min-w-0">
            <span className="block font-semibold">
              {uploading === 'bg'
                ? 'Subiendo foto…'
                : bg.type === 'upload'
                  ? 'Usando tu foto · Cambiar'
                  : 'Subir una foto'}
            </span>
            <span className="block text-sm text-muted-foreground">
              Tu local, tu comida, una textura… Se recorta automáticamente al formato.
            </span>
          </span>
          {bg.type === 'upload' ? (
            <Check className="absolute right-4 top-4 size-5 text-primary" />
          ) : null}
        </button>
      </section>

      <section>
        <SectionTitle hint="Toca para elegir">Fondos predeterminados</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_BACKGROUNDS.map((p) => {
            const active = bg.type === 'preset' && bg.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => choose({ type: 'preset', id: p.id }, p.dark)}
                className={cn(
                  'group relative overflow-hidden rounded-xl text-left transition',
                  active ? 'ring-[3px] ring-primary ring-offset-2 ring-offset-background' : '',
                )}
              >
                <img
                  src={cdnImage(p.file, 240)}
                  alt={p.label}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-5 text-xs font-semibold text-white">
                  {p.label}
                </span>
                {active ? (
                  <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="mr-1 text-sm text-muted-foreground">Color liso</span>
          {SOLID_BACKGROUNDS.map((c) => {
            const active = bg.type === 'color' && bg.color === c
            return (
              <button
                key={c}
                type="button"
                aria-label={`Fondo ${c}`}
                onClick={() => choose({ type: 'color', color: c }, isDarkColor(c))}
                className={cn(
                  'size-9 rounded-full border shadow-inner transition',
                  active && 'ring-[3px] ring-primary ring-offset-2 ring-offset-background',
                )}
                style={{ background: c }}
              />
            )
          })}
          <label
            className={cn(
              'relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]',
            )}
            aria-label="Color personalizado"
          >
            <input
              type="color"
              className="absolute inset-0 opacity-0"
              value={bg.type === 'color' ? bg.color : '#333333'}
              onChange={(e) =>
                choose({ type: 'color', color: e.target.value }, isDarkColor(e.target.value))
              }
            />
          </label>
        </div>
      </section>

      <section>
        <SectionTitle>Capa sobre el fondo</SectionTitle>
        <p className="-mt-2 mb-2 text-sm text-muted-foreground">
          Oscurece o aclara la foto para que el texto se lea mejor.
        </p>
        <div className="mb-1 flex gap-2">
          {[
            { color: '#000000', label: 'Oscurecer' },
            { color: '#ffffff', label: 'Aclarar' },
          ].map((o) => (
            <Button
              key={o.color}
              type="button"
              size="sm"
              variant={s.overlayColor === o.color ? 'default' : 'outline'}
              onClick={() =>
                setMenu((prev) => ({ ...prev, style: { ...prev.style, overlayColor: o.color } }))
              }
            >
              {o.label}
            </Button>
          ))}
        </div>
        <SliderField
          label="Intensidad"
          value={Math.round(s.overlayOpacity * 100)}
          min={0}
          max={85}
          unit="%"
          onChange={(v) =>
            setMenu((prev) => ({ ...prev, style: { ...prev.style, overlayOpacity: v / 100 } }))
          }
        />
      </section>

      <section>
        <SectionTitle hint="Opcional">Logo</SectionTitle>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0], 'logo')}
        />
        <div className="flex items-center gap-3">
          {menu.logoUrl ? (
            <img
              src={menu.logoUrl}
              alt="Logo"
              className="size-14 rounded-lg border bg-[repeating-conic-gradient(#e5e0d6_0_25%,#fff_0_50%)] bg-[length:12px_12px] object-contain p-1"
            />
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => logoRef.current?.click()}
            disabled={uploading === 'logo'}
          >
            {uploading === 'logo' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Upload />
            )}
            {menu.logoUrl ? 'Cambiar logo' : 'Subir logo'}
          </Button>
          {menu.logoUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar logo"
              onClick={() => setMenu((prev) => ({ ...prev, logoUrl: null }))}
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
        {menu.logoUrl ? (
          <SliderField
            label="Tamaño del logo"
            value={s.logoSize}
            min={60}
            max={360}
            unit="px"
            onChange={(v) =>
              setMenu((prev) => ({ ...prev, style: { ...prev.style, logoSize: v } }))
            }
          />
        ) : null}
      </section>
    </div>
  )
}
