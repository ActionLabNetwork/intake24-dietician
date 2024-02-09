<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div v-if="dynamicLogo" class="d-flex align-center mb-5 mb-sm-0">
      <component
        :is="logoIsComponent ? dynamicLogo : 'img'"
        :src="!logoIsComponent ? logo : undefined"
        :width="90"
        aspect-ratio="16/9"
        class="w-100 h-100"
      />
      <div class="ml-4 font-weight-medium w-100">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModuleName } from '@intake24-dietician/portal/types/modules.types'
import { type Component, computed, defineAsyncComponent } from 'vue'

const props = defineProps<{
  logo: string | Component | { path: ModuleName }
  title: string
}>()

function isLogoPath(
  logo: string | Component | { path: ModuleName },
): logo is { path: ModuleName } {
  return typeof logo === 'object' && 'path' in logo
}

const logoIsComponent = computed(() => typeof props.logo !== 'string')
const dynamicLogo = computed<Component | string>(() => {
  const logo = props.logo
  if (isLogoPath(logo)) {
    return defineAsyncComponent(
      () => import(`@/components/feedback-modules/standard/${logo.path}`),
    )
  }
  return props.logo
})
</script>
