// Menu document model shared by the editor, the canvas renderer and the
// draft API. Everything the user can change lives in `Menu`.

export type MenuItem = {
  id: string
  kind: 'dish' | 'section'
  name: string
  price: string
  description: string
}

export type Align = 'left' | 'center' | 'right'

export type MenuStyle = {
  format: FormatId
  // Typography
  titleFont: string
  bodyFont: string
  titleSize: number
  subtitleSize: number
  sectionSize: number
  itemSize: number
  descriptionSize: number
  priceSize: number
  titleWeight: 400 | 700
  itemWeight: 400 | 700
  titleLetterSpacing: number
  sectionLetterSpacing: number
  titleUppercase: boolean
  sectionUppercase: boolean
  itemUppercase: boolean
  // Spacing
  marginX: number
  marginTop: number
  itemGap: number
  sectionGap: number
  titleGap: number
  verticalAlign: 'top' | 'center'
  titleAlign: Align
  sectionAlign: Align
  // Colours
  titleColor: string
  textColor: string
  priceColor: string
  accentColor: string
  descriptionColor: string
  overlayColor: string
  overlayOpacity: number
  // Details
  leader: 'none' | 'dots' | 'line'
  showDivider: boolean
  textShadow: boolean
  panel: boolean
  panelColor: string
  panelOpacity: number
  currency: string
  currencyPosition: 'before' | 'after'
  logoSize: number
}

export type Background =
  | { type: 'preset'; id: string }
  | { type: 'upload'; url: string }
  | { type: 'color'; color: string }

export type Menu = {
  version: 1
  title: string
  subtitle: string
  footer: string
  logoUrl: string | null
  background: Background
  items: Array<MenuItem>
  style: MenuStyle
}

export const FORMATS = {
  story: { label: 'Historia', hint: '9:16', width: 1080, height: 1920 },
  portrait: { label: 'Vertical', hint: '4:5', width: 1080, height: 1350 },
  a4: { label: 'Carta A4', hint: 'Imprimir', width: 1080, height: 1527 },
  square: { label: 'Cuadrado', hint: '1:1', width: 1080, height: 1080 },
} as const

export type FormatId = keyof typeof FORMATS

export const FONTS: Array<{ family: string; category: string }> = [
  { family: 'Playfair Display', category: 'Elegante' },
  { family: 'Cormorant Garamond', category: 'Elegante' },
  { family: 'Lora', category: 'Clásica' },
  { family: 'Libre Baskerville', category: 'Clásica' },
  { family: 'Abril Fatface', category: 'Impacto' },
  { family: 'Bebas Neue', category: 'Impacto' },
  { family: 'Oswald', category: 'Impacto' },
  { family: 'Montserrat', category: 'Moderna' },
  { family: 'Poppins', category: 'Moderna' },
  { family: 'Josefin Sans', category: 'Moderna' },
  { family: 'Raleway', category: 'Moderna' },
  { family: 'Great Vibes', category: 'Manuscrita' },
  { family: 'Dancing Script', category: 'Manuscrita' },
  { family: 'Pacifico', category: 'Manuscrita' },
  { family: 'Caveat', category: 'Tiza' },
  { family: 'Amatic SC', category: 'Tiza' },
]

const fontParam = (family: string) => {
  const name = family.replace(/ /g, '+')
  // Single-weight families on Google Fonts.
  if (['Abril Fatface', 'Bebas Neue', 'Great Vibes', 'Pacifico'].includes(family)) {
    return `family=${name}`
  }
  return `family=${name}:wght@400;700`
}

export const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?${[
  'family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800',
  'family=Manrope:wght@400;500;600;700',
  ...FONTS.map((f) => fontParam(f.family)),
].join('&')}&display=swap`

export const PRESET_BACKGROUNDS = [
  { id: 'pizarra', label: 'Pizarra', file: '/img/fondo-pizarra.png', dark: true },
  { id: 'madera', label: 'Madera', file: '/img/fondo-madera.png', dark: true },
  { id: 'verde', label: 'Esmeralda', file: '/img/fondo-verde.png', dark: true },
  { id: 'marmol', label: 'Mármol', file: '/img/fondo-marmol.png', dark: false },
  { id: 'kraft', label: 'Kraft', file: '/img/fondo-kraft.png', dark: false },
  { id: 'terracota', label: 'Terracota', file: '/img/fondo-terracota.png', dark: false },
] as const

export const SOLID_BACKGROUNDS = ['#1b1a17', '#f5efe3', '#2f3e2e', '#7a2e1f', '#0f2a43', '#ffffff']

export const cdnImage = (path: string, width: number) =>
  `/.netlify/images?url=${encodeURIComponent(path)}&w=${width}&fm=webp`

/** URL the canvas renderer loads for a background, or null for solid colours. */
export function backgroundSource(bg: Background): string | null {
  if (bg.type === 'preset') {
    const preset = PRESET_BACKGROUNDS.find((p) => p.id === bg.id)
    return preset ? cdnImage(preset.file, 1080) : null
  }
  if (bg.type === 'upload') return bg.url
  return null
}

export const DARK_STYLE: Partial<MenuStyle> = {
  titleColor: '#f7efe1',
  textColor: '#f3ece0',
  priceColor: '#e9c46a',
  accentColor: '#e9c46a',
  descriptionColor: '#cfc6b8',
  overlayColor: '#000000',
  panelColor: '#000000',
}

export const LIGHT_STYLE: Partial<MenuStyle> = {
  titleColor: '#2b2118',
  textColor: '#2b2118',
  priceColor: '#9c3d22',
  accentColor: '#9c3d22',
  descriptionColor: '#6b5d50',
  overlayColor: '#ffffff',
  panelColor: '#ffffff',
}

export const DEFAULT_STYLE: MenuStyle = {
  format: 'story',
  titleFont: 'Playfair Display',
  bodyFont: 'Lora',
  titleSize: 104,
  subtitleSize: 34,
  sectionSize: 44,
  itemSize: 40,
  descriptionSize: 26,
  priceSize: 40,
  titleWeight: 700,
  itemWeight: 400,
  titleLetterSpacing: 2,
  sectionLetterSpacing: 6,
  titleUppercase: false,
  sectionUppercase: true,
  itemUppercase: false,
  marginX: 110,
  marginTop: 190,
  itemGap: 30,
  sectionGap: 56,
  titleGap: 70,
  verticalAlign: 'top',
  titleAlign: 'center',
  sectionAlign: 'center',
  titleColor: '#f7efe1',
  textColor: '#f3ece0',
  priceColor: '#e9c46a',
  accentColor: '#e9c46a',
  descriptionColor: '#cfc6b8',
  overlayColor: '#000000',
  overlayOpacity: 0.15,
  leader: 'dots',
  showDivider: true,
  textShadow: false,
  panel: false,
  panelColor: '#000000',
  panelOpacity: 0.35,
  currency: '$',
  currencyPosition: 'before',
  logoSize: 160,
}

/** One-tap looks that set several style fields at once. */
export const QUICK_STYLES: Array<{
  id: string
  label: string
  swatch: [string, string]
  titleFont: string
  bodyFont: string
  style: Partial<MenuStyle>
}> = [
  {
    id: 'bistro',
    label: 'Bistró',
    swatch: ['#1b1a17', '#e9c46a'],
    titleFont: 'Playfair Display',
    bodyFont: 'Lora',
    style: { ...DARK_STYLE, titleUppercase: false, leader: 'dots', sectionUppercase: true },
  },
  {
    id: 'tiza',
    label: 'Pizarra',
    swatch: ['#2a2c2b', '#ffffff'],
    titleFont: 'Amatic SC',
    bodyFont: 'Caveat',
    style: {
      ...DARK_STYLE,
      titleColor: '#ffffff',
      textColor: '#f4f4f0',
      priceColor: '#ffffff',
      accentColor: '#f2d388',
      titleSize: 130,
      itemSize: 46,
      priceSize: 46,
      descriptionSize: 30,
      titleWeight: 700,
      leader: 'line',
      textShadow: false,
    },
  },
  {
    id: 'trattoria',
    label: 'Trattoria',
    swatch: ['#f5efe3', '#9c3d22'],
    titleFont: 'Great Vibes',
    bodyFont: 'Cormorant Garamond',
    style: {
      ...LIGHT_STYLE,
      titleSize: 130,
      titleWeight: 400,
      itemSize: 42,
      priceSize: 42,
      itemWeight: 700,
      leader: 'dots',
    },
  },
  {
    id: 'urbano',
    label: 'Urbano',
    swatch: ['#111111', '#ff6b35'],
    titleFont: 'Bebas Neue',
    bodyFont: 'Montserrat',
    style: {
      ...DARK_STYLE,
      titleColor: '#ffffff',
      priceColor: '#ff6b35',
      accentColor: '#ff6b35',
      titleSize: 150,
      titleLetterSpacing: 8,
      itemSize: 34,
      priceSize: 36,
      descriptionSize: 24,
      itemWeight: 700,
      itemUppercase: true,
      leader: 'none',
      titleAlign: 'left',
      sectionAlign: 'left',
    },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    swatch: ['#ffffff', '#222222'],
    titleFont: 'Josefin Sans',
    bodyFont: 'Raleway',
    style: {
      ...LIGHT_STYLE,
      titleColor: '#222222',
      textColor: '#222222',
      priceColor: '#222222',
      accentColor: '#8a8a8a',
      descriptionColor: '#707070',
      titleSize: 84,
      titleUppercase: true,
      titleLetterSpacing: 14,
      titleWeight: 400,
      itemSize: 34,
      priceSize: 34,
      leader: 'line',
      showDivider: false,
    },
  },
  {
    id: 'cafe',
    label: 'Café',
    swatch: ['#c8a27a', '#3b2416'],
    titleFont: 'Pacifico',
    bodyFont: 'Poppins',
    style: {
      ...LIGHT_STYLE,
      titleColor: '#3b2416',
      textColor: '#3b2416',
      priceColor: '#3b2416',
      accentColor: '#7a4a2a',
      titleSize: 100,
      titleWeight: 400,
      itemSize: 34,
      priceSize: 34,
      itemWeight: 400,
      leader: 'dots',
      panel: true,
      panelColor: '#fff8ec',
      panelOpacity: 0.6,
    },
  },
]

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const dish = (name = '', price = '', description = ''): MenuItem => ({
  id: newId(),
  kind: 'dish',
  name,
  price,
  description,
})

export const section = (name = ''): MenuItem => ({
  id: newId(),
  kind: 'section',
  name,
  price: '',
  description: '',
})

export function createDefaultMenu(): Menu {
  return {
    version: 1,
    title: 'La Cocina',
    subtitle: 'Menú del día',
    footer: 'Pregunta por nuestras opciones vegetarianas',
    logoUrl: null,
    background: { type: 'preset', id: 'pizarra' },
    items: [
      section('Entrantes'),
      dish('Croquetas de jamón', '8.50', 'Seis unidades, cremosas'),
      dish('Ensalada de burrata', '11'),
      section('Principales'),
      dish('Risotto de setas', '15.90', 'Parmesano y trufa negra'),
      dish('Lomo a la parrilla', '19'),
      dish('Pescado del día', '18.50'),
      section('Postres'),
      dish('Tarta de queso', '6.50'),
      dish('Flan casero', '5'),
    ],
    style: { ...DEFAULT_STYLE },
  }
}

/** Fills in any fields missing from an older or partial saved draft. */
export function normalizeMenu(raw: unknown): Menu {
  const base = createDefaultMenu()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Partial<Menu>
  return {
    ...base,
    ...data,
    version: 1,
    items: Array.isArray(data.items) ? data.items : base.items,
    style: { ...DEFAULT_STYLE, ...(data.style ?? {}) },
    background: data.background ?? base.background,
  }
}

export function formatPrice(price: string, style: MenuStyle) {
  const value = price.trim()
  if (!value) return ''
  // Leave prices that already contain a symbol or words untouched.
  if (!/^[\d.,\s]+$/.test(value) || !style.currency) return value
  return style.currencyPosition === 'before'
    ? `${style.currency}${value}`
    : `${value} ${style.currency}`
}
