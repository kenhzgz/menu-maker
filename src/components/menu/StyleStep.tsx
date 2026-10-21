import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'

import { FONTS, FORMATS, QUICK_STYLES } from '@/lib/menu'
import type { Align, FormatId, Menu, MenuStyle } from '@/lib/menu'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  ColorField,
  FontPicker,
  SectionTitle,
  Segmented,
  SliderField,
  ToggleField,
} from './controls'

type Props = {
  menu: Menu
  setMenu: (update: (prev: Menu) => Menu) => void
}

const alignOptions: Array<{ value: Align; label: React.ReactNode }> = [
  { value: 'left', label: <AlignLeft className="size-4" aria-label="Izquierda" /> },
  { value: 'center', label: <AlignCenter className="size-4" aria-label="Centro" /> },
  { value: 'right', label: <AlignRight className="size-4" aria-label="Derecha" /> },
]

export function StyleStep({ menu, setMenu }: Props) {
  const s = menu.style
  const set = <K extends keyof MenuStyle>(key: K, value: MenuStyle[K]) =>
    setMenu((prev) => ({ ...prev, style: { ...prev.style, [key]: value } }))

  const fmtRatio = (id: FormatId) => FORMATS[id].width / FORMATS[id].height

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle hint="Un toque y listo">Estilos rápidos</SectionTitle>
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
          {QUICK_STYLES.map((q) => {
            const active = s.titleFont === q.titleFont && s.bodyFont === q.bodyFont
            return (
              <button
                key={q.id}
                type="button"
                onClick={() =>
                  setMenu((prev) => ({
                    ...prev,
                    style: {
                      ...prev.style,
                      ...q.style,
                      titleFont: q.titleFont,
                      bodyFont: q.bodyFont,
                    },
                  }))
                }
                className={cn(
                  'w-28 shrink-0 overflow-hidden rounded-2xl border bg-card text-left transition',
                  active ? 'border-primary ring-2 ring-primary/30' : 'hover:border-foreground/30',
                )}
              >
                <span
                  className="flex h-16 items-center justify-center text-2xl"
                  style={{
                    background: q.swatch[0],
                    color: q.swatch[1],
                    fontFamily: `"${q.titleFont}"`,
                  }}
                >
                  Menú
                </span>
                <span className="block px-3 py-2 text-xs font-semibold">{q.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <SectionTitle>Formato</SectionTitle>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(FORMATS) as Array<FormatId>).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => set('format', id)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border bg-card px-1 py-3 transition',
                s.format === id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'hover:border-foreground/30',
              )}
            >
              <span
                className={cn(
                  'block h-9 rounded-[3px] border-2',
                  s.format === id ? 'border-primary bg-primary/10' : 'border-foreground/40',
                )}
                style={{ width: 36 * fmtRatio(id) }}
              />
              <span className="text-xs font-semibold">{FORMATS[id].label}</span>
              <span className="text-[10px] text-muted-foreground">{FORMATS[id].hint}</span>
            </button>
          ))}
        </div>
      </section>

      <Accordion type="multiple" defaultValue={['fonts']} className="rounded-2xl border bg-card px-4">
        <AccordionItem value="fonts">
          <AccordionTrigger className="text-base">Fuentes</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Título</div>
              <FontPicker
                value={s.titleFont}
                fonts={FONTS}
                sample="Menú"
                onChange={(f) => set('titleFont', f)}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Platos y precios</div>
              <FontPicker
                value={s.bodyFont}
                fonts={FONTS}
                sample="Plato 12"
                onChange={(f) => set('bodyFont', f)}
              />
            </div>
            <Segmented
              label="Grosor del título"
              value={s.titleWeight}
              onChange={(v) => set('titleWeight', v)}
              options={[
                { value: 400, label: 'Normal' },
                { value: 700, label: <b>Negrita</b> },
              ]}
            />
            <Segmented
              label="Grosor de los platos"
              value={s.itemWeight}
              onChange={(v) => set('itemWeight', v)}
              options={[
                { value: 400, label: 'Normal' },
                { value: 700, label: <b>Negrita</b> },
              ]}
            />
            <div className="divide-y">
              <ToggleField
                label="Título en mayúsculas"
                checked={s.titleUppercase}
                onChange={(v) => set('titleUppercase', v)}
              />
              <ToggleField
                label="Secciones en mayúsculas"
                checked={s.sectionUppercase}
                onChange={(v) => set('sectionUppercase', v)}
              />
              <ToggleField
                label="Platos en mayúsculas"
                checked={s.itemUppercase}
                onChange={(v) => set('itemUppercase', v)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sizes">
          <AccordionTrigger className="text-base">Tamaños</AccordionTrigger>
          <AccordionContent>
            <SliderField label="Título" value={s.titleSize} min={40} max={220} unit="px" onChange={(v) => set('titleSize', v)} />
            <SliderField label="Subtítulo" value={s.subtitleSize} min={16} max={80} unit="px" onChange={(v) => set('subtitleSize', v)} />
            <SliderField label="Secciones" value={s.sectionSize} min={20} max={100} unit="px" onChange={(v) => set('sectionSize', v)} />
            <SliderField label="Platos" value={s.itemSize} min={18} max={80} unit="px" onChange={(v) => set('itemSize', v)} />
            <SliderField label="Precios" value={s.priceSize} min={18} max={80} unit="px" onChange={(v) => set('priceSize', v)} />
            <SliderField label="Descripciones" value={s.descriptionSize} min={14} max={50} unit="px" onChange={(v) => set('descriptionSize', v)} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="spacing">
          <AccordionTrigger className="text-base">Espaciado y posición</AccordionTrigger>
          <AccordionContent>
            <Segmented
              label="Posición vertical"
              value={s.verticalAlign}
              onChange={(v) => set('verticalAlign', v)}
              options={[
                { value: 'top', label: 'Arriba' },
                { value: 'center', label: 'Centrado' },
              ]}
            />
            {s.verticalAlign === 'top' ? (
              <SliderField label="Margen superior" value={s.marginTop} min={30} max={700} unit="px" onChange={(v) => set('marginTop', v)} />
            ) : null}
            <SliderField label="Márgenes laterales" value={s.marginX} min={30} max={300} unit="px" onChange={(v) => set('marginX', v)} />
            <SliderField label="Espacio entre platos" value={s.itemGap} min={0} max={120} unit="px" onChange={(v) => set('itemGap', v)} />
            <SliderField label="Espacio entre secciones" value={s.sectionGap} min={0} max={200} unit="px" onChange={(v) => set('sectionGap', v)} />
            <SliderField label="Espacio bajo el título" value={s.titleGap} min={0} max={240} unit="px" onChange={(v) => set('titleGap', v)} />
            <SliderField label="Espaciado de letras del título" value={s.titleLetterSpacing} min={-4} max={30} unit="px" onChange={(v) => set('titleLetterSpacing', v)} />
            <SliderField label="Espaciado de letras en secciones" value={s.sectionLetterSpacing} min={0} max={30} unit="px" onChange={(v) => set('sectionLetterSpacing', v)} />
            <Segmented label="Alineación del título" value={s.titleAlign} onChange={(v) => set('titleAlign', v)} options={alignOptions} />
            <Segmented label="Alineación de secciones" value={s.sectionAlign} onChange={(v) => set('sectionAlign', v)} options={alignOptions} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger className="text-base">Colores</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              <ColorField label="Título" value={s.titleColor} onChange={(v) => set('titleColor', v)} />
              <ColorField label="Platos" value={s.textColor} onChange={(v) => set('textColor', v)} />
              <ColorField label="Precios" value={s.priceColor} onChange={(v) => set('priceColor', v)} />
              <ColorField label="Secciones" value={s.accentColor} onChange={(v) => set('accentColor', v)} />
              <ColorField label="Descripciones" value={s.descriptionColor} onChange={(v) => set('descriptionColor', v)} />
              <ColorField label="Capa del fondo" value={s.overlayColor} onChange={(v) => set('overlayColor', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="details" className="border-b-0">
          <AccordionTrigger className="text-base">Detalles y precios</AccordionTrigger>
          <AccordionContent>
            <Segmented
              label="Unión entre plato y precio"
              value={s.leader}
              onChange={(v) => set('leader', v)}
              options={[
                { value: 'dots', label: '· · ·' },
                { value: 'line', label: '——' },
                { value: 'none', label: 'Nada' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3 py-1.5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Moneda</span>
                <input
                  value={s.currency}
                  maxLength={4}
                  onChange={(e) => set('currency', e.target.value)}
                  placeholder="$"
                  className="h-10 w-full rounded-xl border bg-card px-3 text-base"
                />
              </label>
              <Segmented
                label="Posición"
                value={s.currencyPosition}
                onChange={(v) => set('currencyPosition', v)}
                options={[
                  { value: 'before', label: `${s.currency || '$'}9` },
                  { value: 'after', label: `9 ${s.currency || '$'}` },
                ]}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {['$', '€', 'S/', 'Bs', 'Q', '£', 'RD$', ''].map((c) => (
                <button
                  key={c || 'none'}
                  type="button"
                  onClick={() => set('currency', c)}
                  className={cn(
                    'h-8 min-w-10 rounded-lg border px-2 text-sm',
                    s.currency === c ? 'border-primary bg-primary/10 text-primary' : 'bg-card',
                  )}
                >
                  {c || 'Sin'}
                </button>
              ))}
            </div>
            <div className="divide-y">
              <ToggleField label="Adorno bajo el título" checked={s.showDivider} onChange={(v) => set('showDivider', v)} />
              <ToggleField
                label="Sombra en el texto"
                description="Mejora la lectura sobre fotos con mucho detalle"
                checked={s.textShadow}
                onChange={(v) => set('textShadow', v)}
              />
              <ToggleField
                label="Recuadro detrás del texto"
                description="Una tarjeta translúcida bajo el menú"
                checked={s.panel}
                onChange={(v) => set('panel', v)}
              />
            </div>
            {s.panel ? (
              <div className="space-y-2 pt-2">
                <ColorField label="Color del recuadro" value={s.panelColor} onChange={(v) => set('panelColor', v)} />
                <SliderField
                  label="Opacidad del recuadro"
                  value={Math.round(s.panelOpacity * 100)}
                  min={5}
                  max={100}
                  unit="%"
                  onChange={(v) => set('panelOpacity', v / 100)}
                />
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
