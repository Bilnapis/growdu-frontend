export const defaultPrimaryColor = '#1F8FE5'
export const themePresets = [
  { name: 'Biru', color: '#1F8FE5' },
  { name: 'Hijau', color: '#12B76A' },
  { name: 'Ungu', color: '#7A5AF8' },
  { name: 'Oranye', color: '#F79009' },
  { name: 'Merah', color: '#F04438' },
] as const

export function isHexColor(value: string) {
  return /^#[\da-f]{6}$/i.test(value)
}

type Rgb = [number, number, number]

function rgb(hex: string): Rgb {
  return [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16),
  ) as Rgb
}

function hex(channels: Rgb) {
  return `#${channels.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

function mix(color: string, target: string, amount: number) {
  const source = rgb(color)
  const end = rgb(target)
  return hex(
    source.map((value, index) => value + (end[index] - value) * amount) as Rgb,
  )
}

function luminance(color: string) {
  const channels = rgb(color).map((value) => {
    const scaled = value / 255
    return scaled <= 0.04045
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function contrastRatio(first: string, second: string) {
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function readableAccent(color: string, backgrounds: string[], minimum = 4.5) {
  for (let step = 0; step <= 100; step += 1) {
    const candidate = mix(color, '#000000', step / 100)
    if (
      backgrounds.every(
        (background) => contrastRatio(candidate, background) >= minimum,
      )
    )
      return candidate
  }
  return '#000000'
}

export function colorHsl(color: string) {
  const [r, g, b] = rgb(color).map((value) => value / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  let hue = 0
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
  }
  return { hue: (hue * 60 + 360) % 360, saturation, lightness }
}

function hslChannels(color: string) {
  const { hue, saturation, lightness } = colorHsl(color)
  return `${hue.toFixed(2)} ${(saturation * 100).toFixed(2)}% ${(lightness * 100).toFixed(2)}%`
}

export function withHue(color: string, hue: number) {
  const current = colorHsl(color)
  const saturation = current.saturation || 0.8
  const lightness = current.saturation === 0 ? 0.5 : current.lightness
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = lightness - chroma / 2
  const sectors: Rgb[] = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ]
  const sector = sectors[Math.floor((hue % 360) / 60)]
  return hex(sector.map((value) => (value + m) * 255) as Rgb)
}

export function getThemeTokens(input: string): Record<string, string> {
  const primary = isHexColor(input) ? input.toUpperCase() : defaultPrimaryColor
  const foreground =
    contrastRatio(primary, '#FFFFFF') >= contrastRatio(primary, '#000000')
      ? '#FFFFFF'
      : '#000000'
  const soft = mix(primary, '#FFFFFF', 0.9)
  const text = readableAccent(primary, ['#FFFFFF', '#F6F8FB', soft])
  const hover = mix(
    primary,
    foreground === '#FFFFFF' ? '#000000' : '#FFFFFF',
    0.12,
  )
  const ring = readableAccent(primary, ['#FFFFFF', '#F6F8FB'], 3)
  const tokens: Record<string, string> = {
    '--color-primary': primary,
    '--color-primary-foreground': foreground,
    '--color-primary-hover': hover,
    '--color-primary-soft': soft,
    '--color-primary-text': text,
    '--color-primary-dark': text,
    '--color-primary-darker': mix(text, '#000000', 0.2),
    '--primary': hslChannels(primary),
    '--primary-foreground': hslChannels(foreground),
    '--primary-text': hslChannels(text),
    '--ring': hslChannels(ring),
  }
  for (const [shade, amount] of [
    [50, 0.95],
    [100, 0.9],
    [200, 0.75],
    [300, 0.5],
    [400, 0.25],
  ] as const) {
    tokens[`--color-brand-${shade}`] = mix(primary, '#FFFFFF', amount)
  }
  tokens['--color-brand-500'] = primary
  for (const [shade, amount] of [
    [600, 0],
    [700, 0.15],
    [800, 0.3],
    [900, 0.45],
  ] as const) {
    tokens[`--color-brand-${shade}`] = mix(text, '#000000', amount)
  }
  return tokens
}
