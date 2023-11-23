import type { Component } from 'vue'

const moduleRoutes = [
  '/meal-diary',
  '/carbs-exchange',
  '/energy-intake',
  '/fibre-intake',
  '/water-intake',
] as const

export type ModuleRoute = (typeof moduleRoutes)[number]
export type ComponentMapping = Record<ModuleRoute, Component>
