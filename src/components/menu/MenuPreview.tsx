import { useEffect, useRef, useState } from 'react'

import { FORMATS } from '@/lib/menu'
import type { Menu } from '@/lib/menu'
import { drawMenu, ensureFonts, loadAssets } from '@/lib/render-menu'
import { cn } from '@/lib/utils'

/** Live canvas preview. Uses the same renderer as the exported image. */
export function MenuPreview({ menu, className }: { menu: Menu; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [ready, setReady] = useState(false)
  const [fontTick, setFontTick] = useState(0)

  const fmt = FORMATS[menu.style.format]
  const ratio = fmt.width / fmt.height
  const fit =
    box.w / box.h > ratio
      ? { w: box.h * ratio, h: box.h }
      : { w: box.w, h: box.w / ratio }

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: width, h: height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Redraw when web fonts finish loading in the background.
  useEffect(() => {
    const onLoaded = () => setFontTick((t) => t + 1)
    document.fonts.addEventListener('loadingdone', onLoaded)
    return () => document.fonts.removeEventListener('loadingdone', onLoaded)
  }, [])

  useEffect(() => {
    if (!fit.w) return
    let cancelled = false
    const frame = requestAnimationFrame(async () => {
      await ensureFonts(menu.style)
      const assets = await loadAssets(menu)
      if (cancelled || !canvasRef.current) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Preview at screen resolution; the export renders at full size.
      const scale = Math.min(1, Math.max(0.3, (fit.w * dpr) / fmt.width))
      drawMenu(canvasRef.current, menu, assets, scale)
      setReady(true)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [menu, fontTick, fit.w, fmt.width])

  return (
    <div
      ref={boxRef}
      className={cn('flex h-full w-full items-center justify-center', className)}
    >
      <div
        className="relative overflow-hidden rounded-[14px] bg-neutral-800 shadow-[0_24px_60px_-24px_rgba(60,30,0,0.6)] ring-1 ring-black/10"
        style={{ width: fit.w || undefined, height: fit.h || undefined }}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            'block size-full transition-opacity duration-300',
            ready ? 'opacity-100' : 'opacity-0',
          )}
          aria-label={`Vista previa del menú ${menu.title}`}
          role="img"
        />
        {!ready ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-neutral-700 to-neutral-800" />
        ) : null}
      </div>
    </div>
  )
}
