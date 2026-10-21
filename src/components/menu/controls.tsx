import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="font-display text-lg font-semibold tracking-tight">{children}</h3>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  format?: (value: number) => string
}) {
  return (
    <label className="block py-1.5">
      <span className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {format ? format(value) : `${value}${unit}`}
        </span>
      </span>
      <input
        type="range"
        className="h-8 w-full cursor-pointer"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2">
      <span
        className="relative size-8 shrink-0 overflow-hidden rounded-full border shadow-inner"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block font-mono text-[11px] uppercase text-muted-foreground">
          {value}
        </span>
      </span>
    </label>
  )
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: Array<{ value: T; label: ReactNode }>
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div className="py-1.5">
      {label ? <div className="mb-1.5 text-sm font-medium">{label}</div> : null}
      <div className="flex rounded-xl bg-muted p-1" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg px-2 text-sm font-medium transition',
              value === opt.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

export function FontPicker({
  value,
  fonts,
  onChange,
  sample,
}: {
  value: string
  fonts: Array<{ family: string; category: string }>
  onChange: (family: string) => void
  sample: string
}) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
      {fonts.map((f) => (
        <button
          key={f.family}
          type="button"
          onClick={() => onChange(f.family)}
          aria-pressed={value === f.family}
          className={cn(
            'flex w-28 shrink-0 snap-start flex-col items-start rounded-xl border bg-card px-3 py-2 text-left transition',
            value === f.family
              ? 'border-primary ring-2 ring-primary/30'
              : 'hover:border-foreground/30',
          )}
        >
          <span
            className="block w-full truncate text-2xl leading-tight"
            style={{ fontFamily: `"${f.family}"` }}
          >
            {sample}
          </span>
          <span className="mt-1 block w-full truncate text-[11px] text-muted-foreground">
            {f.family}
          </span>
        </button>
      ))}
    </div>
  )
}
