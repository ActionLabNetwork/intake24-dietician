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
                  <div v-if="showSwitches">
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import type { ModuleName } from '@intake24-dietician/portal/types/modules.types'
import { FeedbackMapping } from '@intake24-dietician/portal/components/master-settings/ModuleSelectionAndFeedbackPersonalisation.vue'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'

export interface ModuleItem {
  title: ModuleName
  value: number
  selected: boolean
}

const props = withDefaults(
  defineProps<{
    defaultState?: FeedbackMapping
    showSwitches: boolean
  }>(),
  {
    defaultState: undefined,
    showSwitches: false,
  },
)

const emit = defineEmits<{
  update: [value: ModuleName]
  'update:modules': [items: ModuleItem[]]
}>()

const route = useRoute()
const surveyQuery = useSurveyById(route.params['surveyId'] as string)

const drag = ref(false)

const items = ref<ModuleItem[]>([])

const selectedModule = ref(1)

const handleModuleSelect = (title: ModuleName) => {
  const item = items.value.find(i => i.title === title)

  if (!item) return
  selectedModule.value = item.value
  emit('update', item.title)
}

const initWithDefaultValues = () => {
  if (!props.defaultState) return

  items.value = Object.entries(props.defaultState).map(
    ([key, value], index) => {
      return {
        title: key as ModuleName,
        value: index + 1,
        selected: value.isActive,
      }
    },
  )
}

const initWithValuesFromClinicSettings = () => {
  if (!surveyQuery.data.value) return

  const feedbackModules = surveyQuery.data.value.feedbackModules ?? []
  items.value = feedbackModules.map((module, index) => {
    return {
      title: module.name as ModuleName,
      value: index + 1,
      selected: module.isActive,
    }
  })
}

watch(
  () => surveyQuery.data.value,
  newData => {
    // We are using default state
    if (props.defaultState) {
      initWithDefaultValues()
      emit('update:modules', items.value)
      return
    }

    if (!newData) return // No data yet
    // Otherwise, we are using the clinic settings
    initWithValuesFromClinicSettings()
    emit('update:modules', items.value)
  },
  { immediate: true },
)
</script>
