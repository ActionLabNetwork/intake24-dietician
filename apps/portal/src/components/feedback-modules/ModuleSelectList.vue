<template>
  <div class="d-flex">
    <div style="width: 100%">
      <v-card>
        <div class="pa-5 text-h6">Recall data</div>
        <v-list>
          <draggable
            v-model="items"
            item-key="title"
            @start="drag = true"
            @end="drag = false"
          >
            <template #item="{ element }">
              <v-list-item
                :key="element.value"
                :value="element.value"
                :active="element.value === selectedModule"
                rounded="xl"
                class="ma-2"
                @click="() => handleModuleSelect(element.title)"
              >
                <div
                  class="d-flex flex-row flex-md-row align-center justify-space-between px-2"
                >
                  <div class="d-flex">
                    <div><v-icon icon="mdi-drag"></v-icon></div>
                    <div>{{ element.title }}</div>
                  </div>
                  <div>
                    <v-switch
                      v-model:model-value="element.selected"
                      class="d-flex align-center"
                      color="success"
                      @update:model-value="emit('update:modules', items)"
                    ></v-switch>
                  </div>
                </div>
              </v-list-item>
            </template>
          </draggable>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import type { ModuleRoute } from '@intake24-dietician/portal/types/modules.types'

export interface ModuleItem {
  title: string
  value: number
  selected: boolean
  to: ModuleRoute
}

const emit = defineEmits<{
  update: [value: ModuleRoute]
  'update:modules': [items: ModuleItem[]]
}>()

const route = useRoute()

const drag = ref(false)

const items = ref<ModuleItem[]>([
  {
    title: 'Meal diary',
    value: 1,
    selected: false,
    to: '/meal-diary',
  },
  {
    title: 'Carbs exchange',
    value: 2,
    selected: false,
    to: '/carbs-exchange',
  },
  {
    title: 'Energy intake',
    value: 3,
    selected: false,
    to: '/energy-intake',
  },
  { title: 'Fibre intake', value: 4, selected: false, to: '/fibre-intake' },
  { title: 'Water intake', value: 5, selected: false, to: '/water-intake' },
])

const selectedModule = ref(1)

onMounted(() => {
  const currentRoute = route.path.split('/').pop() ?? ''
  selectedModule.value =
    items.value.find(i => i.to.includes(currentRoute))?.value ?? 1
})

const handleModuleSelect = (title: ModuleRoute) => {
  const item = items.value.find(i => i.title === title)

  if (!item) return
  selectedModule.value = item.value
  emit('update', item.to)
}
</script>
