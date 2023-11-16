import chroma from 'chroma-js'

export const generatePastelPalette = (
  numColors: number,
  mealHours: number[],
): string[] => {
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
