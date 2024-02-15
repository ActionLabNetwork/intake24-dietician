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
    <div>
      <v-menu
        transition="scale-transition"
        location="bottom"
        :close-on-content-click="false"
      >
        <template #activator="{ props: _props }">
          <v-btn class="text-none" variant="outlined" v-bind="_props">
            Metrics
          </v-btn>
        </template>

        <div class="menu">
          <p class="px-2 pt-2 font-weight-medium">Manage metrics</p>
          <v-list>
            <v-list-item v-for="(item, i) in props.metrics" :key="i">
              <v-list-item-title>
                <v-radio-group v-model="metric">
                  <v-radio :value="item">
                    <template #label>
                      <div>
                        <p>{{ item.description }}</p>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
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

const props = defineProps<{
  logo: string | Component | { path: ModuleName }
  title: string
  metrics?: {
    id: number
    description: string
    unit: {
      symbol: string | null
      description: string
    }
  }[]
}>()

// const metric = ref<string | null>(items.value[0] ?? null)
const metric = defineModel<
  | {
      id: number
      description: string
      unit: {
        symbol: string | null
        description: string
      }
    }
  | undefined
>()

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

<style scoped lang="scss">
.menu {
  min-width: 10rem;
  border: 1px solid black;
  border-radius: 6px;
  max-height: 15rem;
  overflow-y: scroll;
}
</style>
