import { useBreakpoints } from '@vueuse/core'
const _breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1264,
  xl: 1904,
} as const

export const useDeviceBreakpoint = () => {
  const breakpoints = useBreakpoints(_breakpoints)
  return { breakpoints }
}
