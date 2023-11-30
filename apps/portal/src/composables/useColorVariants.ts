// colorVariants is an array of colors generated from the base color using Chroma.js.
// Refs are reactive, so they will update when the base color changes.

// Returns an object containing color variants based on a base color.
// The base color defaults to '#00DF59' if not provided.

// Usage:
// const { colors } = useColorVariants('#00DF59')
// colors.value.base // '#00DF59'
// colors.value.lighter // '#9de2a1'

import { ref } from 'vue'
import chroma from 'chroma-js'

/**
 * Returns an object containing color variants based on a base color.
 * @param baseColor The base color to generate variants from. Default is '#00DF59'.
 * @returns An object containing color variants.
 */
export default function useColorVariants(baseColor = '#00DF59') {
  const colorVariants = chroma
    .scale(['black', baseColor, 'white'])
    .mode('lab')
    .colors(7)

  const colors = ref({
    darkest: colorVariants[0],
    darker: colorVariants[1],
    dark: colorVariants[2],
    base: baseColor,
    light: colorVariants[4],
    lighter: colorVariants[5],
    lightest: colorVariants[6],
  })

  return { colors }
}
