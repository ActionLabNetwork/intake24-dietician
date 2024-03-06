<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div v-if="dynamicLogo" class="d-flex align-center mb-5 mb-sm-0">
      <component
        :is="logoIsComponent ? dynamicLogo : 'img'"
        :src="!logoIsComponent ? logo : undefined"
        :width="130"
        aspect-ratio="16/9"
        :class="logoIsComponent ? 'w-100 h-100' : ''"
      />

      <Logo />
      <div class="ml-4 font-weight-medium w-100">{{ title }}</div>
    </div>
    <div v-if="showMetrics && allMetrics && allMetrics.length > 0">
      <v-menu
        transition="scale-transition"
        location="bottom"
        :close-on-content-click="false"
      >
        <template #activator="{ props: _props }">
          <v-btn class="text-none bg-white" variant="outlined" v-bind="_props">
            Metrics
            <template #append>
              <v-icon icon="mdi-chevron-down" />
            </template>
          </v-btn>
        </template>
        <div class="menu">
          <p class="px-2 pt-2 font-weight-medium">
            Manage metrics ({{ metrics?.length ?? 0 }}/{{ MAX_METRICS }})
          </p>
          <v-list>
            <v-list-item v-for="metric in allMetrics" :key="metric.id">
              <v-list-item-title>
                <v-checkbox
                  v-model="metrics"
                  :label="metric.description"
                  :value="metric"
                  :disabled="
                    (disableCheckbox &&
                      metrics?.length === 1 &&
                      metrics.includes(metric)) ||
                    (metrics?.length === MAX_METRICS &&
                      !metrics.includes(metric))
                  "
                />
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModuleName } from '@intake24-dietician/portal/types/modules.types'
import { type Component, computed, defineAsyncComponent } from 'vue'
import { VMenu } from 'vuetify/lib/components/index.mjs'
import { NutrientType } from '../standard/meal-diary/MealDiaryModule.vue'

const MAX_METRICS = 3

const props = defineProps<{
  logo: string | Component | { path: ModuleName }
  title: string
  allMetrics?: NutrientType[]
  showMetrics?: boolean
}>()

// const metric = ref<string | null>(items.value[0] ?? null)
const metrics = defineModel<NutrientType[]>('metrics')

function isLogoPath(
  logo: string | Component | { path: ModuleName },
): logo is { path: ModuleName } {
  return typeof logo === 'object' && 'path' in logo
}

const logoIsComponent = computed(() => typeof props.logo !== 'string')
const dynamicLogo = computed<Component | string>(() => {
  const logo = props.logo

  if (isLogoPath(logo)) {
    return defineAsyncComponent(() =>
      import(`@/components/feedback-modules/standard/${logo.path}`).catch(
        () => {},
      ),
    )
  }

  return props.logo
})
const disableCheckbox = computed(() => metrics.value?.length ?? 0 <= 1)
</script>

<style scoped lang="scss">
.menu {
  min-width: 10rem;
  border: 1px solid black;
  border-radius: 6px;
  max-height: 15rem;
  overflow-y: scroll;
  background-color: white;
}
</style>
