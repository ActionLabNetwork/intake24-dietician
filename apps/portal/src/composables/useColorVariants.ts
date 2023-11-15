// useColorVariants.js
import { ref } from 'vue'
import chroma from 'chroma-js'

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
