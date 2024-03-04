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
            @end="
              () => {
                persistModulesOrder()
                emit('update:modules', items)
                drag = false
              }
            "
          >
            <template #item="{ element }">
              <v-list-item
                :key="element.value"
                :value="element.title"
                :active="element.title === selectedModule"
                rounded="lg"
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
                      @update:model-value="
                        () => {
                          router.replace({
                            query: {
                              selected: items
                                .filter(i => i.selected)
                                .map(i => moduleIdentifiers[i.title])
                                .join(','),
                            },
                          })
                          emit('update:modules', items)
                        }
                      "
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
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import type { ModuleName } from '@intake24-dietician/portal/types/modules.types'
import { FeedbackMapping } from '@intake24-dietician/portal/components/master-settings/ModuleSelectionAndFeedbackPersonalisation.vue'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { moduleIdentifiers } from '@intake24-dietician/common/types/modules'
import { useStorage } from '@vueuse/core'

export interface ModuleItem {
  title: ModuleName
  value: number
  selected: boolean
}

const props = withDefaults(
  defineProps<{
    showSwitches?: boolean
    useUrlAsState?: boolean
  }>(),
  {
    showSwitches: false,
    useUrlAsState: false,
  },
)

const emit = defineEmits<{
  'update:modules': [items: ModuleItem[]]
}>()

const defaultState = defineModel<FeedbackMapping>('defaultState')
const selectedModule = defineModel<ModuleName>('module')

const modulesOrdering = useStorage('modules-ordering', '')
const moduleItemsSorted = ref(false)
const router = useRouter()
const route = useRoute()
const surveyQuery = useSurveyById(route.params['surveyId'] as string)

const drag = ref(false)
const items = ref<ModuleItem[]>([])
const handleModuleSelect = (title: ModuleName) => {
  const item = items.value.find(i => i.title === title)

  if (!item) return
  selectedModule.value = item.title
}

const persistModulesOrder = () => {
  const moduleNames = items.value.map(i => i.title)
  const moduleNamesSerialized = JSON.stringify(moduleNames)
  modulesOrdering.value = moduleNamesSerialized
  console.log({ moduleNamesSerialized })
}

const initWithDefaultValues = () => {
  if (!defaultState.value) return

  items.value = Object.entries(defaultState.value).map(
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

const initWithSavedModulesOrdering = () => {
  // Sort items according to the stored order
  if (modulesOrdering.value) {
    const moduleNames = JSON.parse(modulesOrdering.value) as ModuleName[]

    // If the number of modules has changed, we don't want to use the saved ordering
    if (moduleNames.length !== items.value.length) {
      moduleItemsSorted.value = true
      return
    }

    const sortedItems = moduleNames.map((name, index) => {
      const item = items.value.find(i => i.title === name)
      return {
        title: item?.title ?? 'Meal diary',
        value: index + 1,
        selected: item?.selected ?? true,
      }
    })
    items.value = sortedItems
  }
  moduleItemsSorted.value = true
}
watch(
  () => surveyQuery.data.value,
  newData => {
    // We are using default state
    if (defaultState.value) {
      initWithDefaultValues()
      emit('update:modules', items.value)
      initWithSavedModulesOrdering()
      return
    }

    if (!newData) return // No data yet
    // Otherwise, we are using the clinic settings
    initWithValuesFromClinicSettings()
    emit('update:modules', items.value)

    // Use url as state if appropriate
    if (props.useUrlAsState && route.query['selected']) {
      const selected = (route.query['selected'] as string).split(',')

      items.value = items.value.map(item => ({
        ...item,
        selected: selected.includes(moduleIdentifiers[item.title]),
      }))
      emit('update:modules', items.value)
    }

    initWithSavedModulesOrdering()
  },
  { immediate: true },
)
</script>
