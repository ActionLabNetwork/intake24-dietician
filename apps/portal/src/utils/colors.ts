import chroma from 'chroma-js'

export function generatePastelPalette(
  numColors: number,
  mealHours: number[],
): string[] {
  const palette: { hue: number; hex: string }[] = []
  const baseLightness = 0.9
  const baseSaturation = 0.5
  const contrastRatioThreshold = 4.5

  for (let i = 0; i < numColors; i++) {
    const hue: number = (360 / numColors) * i
    const color = chroma.hsl(hue, baseSaturation, baseLightness)
    const contrastRatio = chroma.contrast(color, 'black')

    if (contrastRatio >= contrastRatioThreshold) {
      palette.push({ hue, hex: color.hex() })
    }
  }

  const mealHues = mealHours.map(hour => hour / 24)

  const sortedPalette = palette.sort((a, b) => {
    const aMinDistance = Math.min(
      ...mealHours.map(meal => Math.abs(a.hue / 360 - (mealHues[meal] ?? 0))),
    )
    const bMinDistance = Math.min(
      ...mealHours.map(meal => Math.abs(b.hue / 360 - (mealHues[meal] ?? 0))),
    )
    return aMinDistance - bMinDistance
  })

  return sortedPalette.map(color => color.hex)
}

// Simple hash function
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

export function stringToColor(str: string) {
  hash = simpleHash(str)

  // Convert hash to a color
  let color = '#'
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).substr(-2)
  }
  return color
}

export function generateDistinctColors(strings) {
  const colors = []
  const hueStep = 360 / strings.length

  for (const str of strings) {
    const hash = simpleHash(str)
    const hue = (hash % strings.length) * hueStep
    const color = chroma.hsl(hue, 0.9, 0.5).hex()
    colors.push(color)
  }

  return colors
}
