// Draws a Menu onto a <canvas>. The same function powers the live preview and
// the exported image, so what the user sees is exactly what gets saved.
// All measurements are in a 1080px-wide reference space and scaled on draw.

import { FORMATS, backgroundSource, formatPrice } from './menu'
import type { Align, Menu, MenuStyle } from './menu'

const imageCache = new Map<string, Promise<HTMLImageElement | null>>()

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  let cached = imageCache.get(src)
  if (!cached) {
    cached = new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = () => {
        imageCache.delete(src)
        resolve(null)
      }
      img.src = src
    })
    imageCache.set(src, cached)
  }
  return cached
}

export async function ensureFonts(style: MenuStyle) {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  const specs = [
    `400 40px "${style.titleFont}"`,
    `700 40px "${style.titleFont}"`,
    `400 40px "${style.bodyFont}"`,
    `700 40px "${style.bodyFont}"`,
    `italic 400 40px "${style.bodyFont}"`,
  ]
  await Promise.all(specs.map((s) => document.fonts.load(s).catch(() => null)))
}

export type MenuAssets = {
  background: HTMLImageElement | null
  logo: HTMLImageElement | null
}

export async function loadAssets(menu: Menu): Promise<MenuAssets> {
  const bgSrc = backgroundSource(menu.background)
  const [background, logo] = await Promise.all([
    bgSrc ? loadImage(bgSrc) : Promise.resolve(null),
    menu.logoUrl ? loadImage(menu.logoUrl) : Promise.resolve(null),
  ])
  return { background, logo }
}

const font = (
  family: string,
  size: number,
  weight: number = 400,
  italic = false,
) => `${italic ? 'italic ' : ''}${weight} ${size}px "${family}", Georgia, serif`

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  if ('letterSpacing' in ctx) {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${px}px`
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: Array<string> = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

function alignX(align: Align, left: number, right: number) {
  if (align === 'left') return left
  if (align === 'right') return right
  return (left + right) / 2
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

const upper = (text: string, on: boolean) => (on ? text.toLocaleUpperCase('es') : text)

/** Paints the menu content starting at y. With `dry` only measures. Returns end y. */
function paintContent(
  ctx: CanvasRenderingContext2D,
  menu: Menu,
  assets: MenuAssets,
  W: number,
  startY: number,
  dry: boolean,
) {
  const s = menu.style
  const left = s.marginX
  const right = W - s.marginX
  const width = right - left
  let y = startY

  const shadowOn = () => {
    if (s.textShadow && !dry) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)'
      ctx.shadowBlur = 14
      ctx.shadowOffsetY = 3
    }
  }
  const shadowOff = () => {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  }

  ctx.textBaseline = 'middle'
  shadowOn()

  // Logo
  if (assets.logo && menu.logoUrl) {
    const h = s.logoSize
    const w = (assets.logo.naturalWidth / assets.logo.naturalHeight) * h
    const x =
      s.titleAlign === 'left' ? left : s.titleAlign === 'right' ? right - w : (W - w) / 2
    if (!dry) ctx.drawImage(assets.logo, x, y, w, h)
    y += h + 28
  }

  // Title
  if (menu.title.trim()) {
    ctx.font = font(s.titleFont, s.titleSize, s.titleWeight)
    setSpacing(ctx, s.titleLetterSpacing)
    ctx.textAlign = s.titleAlign
    ctx.fillStyle = s.titleColor
    const lh = s.titleSize * 1.12
    for (const line of wrap(ctx, upper(menu.title, s.titleUppercase), width)) {
      if (!dry) ctx.fillText(line, alignX(s.titleAlign, left, right), y + lh / 2)
      y += lh
    }
  }

  // Subtitle
  if (menu.subtitle.trim()) {
    y += 10
    ctx.font = font(s.bodyFont, s.subtitleSize, 400, true)
    setSpacing(ctx, 1)
    ctx.textAlign = s.titleAlign
    ctx.fillStyle = s.descriptionColor
    const lh = s.subtitleSize * 1.3
    for (const line of wrap(ctx, menu.subtitle, width)) {
      if (!dry) ctx.fillText(line, alignX(s.titleAlign, left, right), y + lh / 2)
      y += lh
    }
  }

  // Ornamental divider
  if (s.showDivider) {
    y += 26
    if (!dry) {
      const cx =
        s.titleAlign === 'left' ? left + 70 : s.titleAlign === 'right' ? right - 70 : W / 2
      ctx.save()
      shadowOff()
      ctx.strokeStyle = s.accentColor
      ctx.fillStyle = s.accentColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx - 70, y)
      ctx.lineTo(cx - 14, y)
      ctx.moveTo(cx + 14, y)
      ctx.lineTo(cx + 70, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, y - 7)
      ctx.lineTo(cx + 7, y)
      ctx.lineTo(cx, y + 7)
      ctx.lineTo(cx - 7, y)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      shadowOn()
    }
    y += 8
  }

  y += s.titleGap

  // Items
  menu.items.forEach((item, index) => {
    if (item.kind === 'section') {
      if (!item.name.trim()) return
      if (index > 0) y += s.sectionGap
      ctx.font = font(s.bodyFont, s.sectionSize, 700)
      setSpacing(ctx, s.sectionLetterSpacing)
      ctx.textAlign = s.sectionAlign
      ctx.fillStyle = s.accentColor
      const lh = s.sectionSize * 1.25
      for (const line of wrap(ctx, upper(item.name, s.sectionUppercase), width)) {
        if (!dry) ctx.fillText(line, alignX(s.sectionAlign, left, right), y + lh / 2)
        y += lh
      }
      y += s.itemGap * 0.8
      return
    }

    if (!item.name.trim() && !item.price.trim()) return

    const priceText = formatPrice(item.price, s)
    ctx.font = font(s.bodyFont, s.priceSize, 700)
    setSpacing(ctx, 0)
    const priceW = priceText ? ctx.measureText(priceText).width : 0
    const gap = priceText ? 28 : 0
    const nameMax = width - priceW - gap

    ctx.font = font(s.bodyFont, s.itemSize, s.itemWeight)
    setSpacing(ctx, s.itemUppercase ? 1.5 : 0)
    ctx.textAlign = 'left'
    const lh = s.itemSize * 1.25
    const lines = wrap(ctx, upper(item.name, s.itemUppercase), nameMax)
    lines.forEach((line, i) => {
      const cy = y + lh / 2
      if (!dry) {
        ctx.fillStyle = s.textColor
        ctx.fillText(line, left, cy)
      }
      if (i === lines.length - 1 && priceText && !dry) {
        const nameEnd = left + ctx.measureText(line).width
        const priceStart = right - priceW
        // Leader between name and price
        const from = nameEnd + 16
        const to = priceStart - 16
        if (s.leader !== 'none' && to - from > 18) {
          ctx.save()
          shadowOff()
          ctx.fillStyle = s.textColor
          ctx.strokeStyle = s.textColor
          ctx.globalAlpha = 0.55
          const ly = cy + s.itemSize * 0.22
          if (s.leader === 'dots') {
            const step = Math.max(10, s.itemSize * 0.3)
            for (let x = to; x >= from; x -= step) {
              ctx.beginPath()
              ctx.arc(x, ly, Math.max(1.6, s.itemSize * 0.05), 0, Math.PI * 2)
              ctx.fill()
            }
          } else {
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(from, ly)
            ctx.lineTo(to, ly)
            ctx.stroke()
          }
          ctx.restore()
          shadowOn()
        }
        ctx.font = font(s.bodyFont, s.priceSize, 700)
        setSpacing(ctx, 0)
        ctx.textAlign = 'right'
        ctx.fillStyle = s.priceColor
        ctx.fillText(priceText, right, cy)
        ctx.font = font(s.bodyFont, s.itemSize, s.itemWeight)
        setSpacing(ctx, s.itemUppercase ? 1.5 : 0)
        ctx.textAlign = 'left'
      }
      y += lh
    })

    if (item.description.trim()) {
      y += 2
      ctx.font = font(s.bodyFont, s.descriptionSize, 400, true)
      setSpacing(ctx, 0)
      ctx.textAlign = 'left'
      ctx.fillStyle = s.descriptionColor
      const dlh = s.descriptionSize * 1.3
      for (const line of wrap(ctx, item.description, nameMax)) {
        if (!dry) ctx.fillText(line, left, y + dlh / 2)
        y += dlh
      }
    }
    y += s.itemGap
  })

  shadowOff()
  return y - s.itemGap
}

export function drawMenu(
  canvas: HTMLCanvasElement,
  menu: Menu,
  assets: MenuAssets,
  pixelScale = 1,
) {
  const s = menu.style
  const fmt = FORMATS[s.format]
  const W = fmt.width
  const H = fmt.height
  canvas.width = Math.round(W * pixelScale)
  canvas.height = Math.round(H * pixelScale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0)
  ctx.imageSmoothingQuality = 'high'

  // Background
  if (menu.background.type === 'color') {
    ctx.fillStyle = menu.background.color
    ctx.fillRect(0, 0, W, H)
  } else if (assets.background) {
    drawCover(ctx, assets.background, W, H)
  } else {
    ctx.fillStyle = '#26231f'
    ctx.fillRect(0, 0, W, H)
  }

  if (s.overlayOpacity > 0) {
    ctx.globalAlpha = s.overlayOpacity
    ctx.fillStyle = s.overlayColor
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
  }

  const footerSize = Math.round(s.descriptionSize * 0.95)
  const footerSpace = menu.footer.trim() ? footerSize * 1.4 + 80 : 0

  const contentEnd = paintContent(ctx, menu, assets, W, 0, true)
  const contentH = contentEnd
  const startY =
    s.verticalAlign === 'center'
      ? Math.max(60, (H - footerSpace - contentH) / 2)
      : s.marginTop

  if (s.panel) {
    ctx.globalAlpha = s.panelOpacity
    ctx.fillStyle = s.panelColor
    roundRect(ctx, s.marginX - 48, startY - 56, W - 2 * s.marginX + 96, contentH + 112, 28)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  paintContent(ctx, menu, assets, W, startY, false)

  if (menu.footer.trim()) {
    ctx.font = font(s.bodyFont, footerSize, 400, true)
    setSpacing(ctx, 1)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = s.descriptionColor
    if (s.textShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)'
      ctx.shadowBlur = 14
    }
    const lines = wrap(ctx, menu.footer, W - 2 * s.marginX)
    const lh = footerSize * 1.4
    let fy = H - 70 - lines.length * lh
    for (const line of lines) {
      ctx.fillText(line, W / 2, fy + lh / 2)
      fy += lh
    }
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }
}

/** Renders the menu at high resolution and returns it as an image file. */
export async function exportMenu(menu: Menu, pixelScale = 2): Promise<Blob> {
  await ensureFonts(menu.style)
  const assets = await loadAssets(menu)
  const canvas = document.createElement('canvas')
  drawMenu(canvas, menu, assets, pixelScale)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo crear la imagen'))),
      'image/jpeg',
      0.94,
    ),
  )
}
