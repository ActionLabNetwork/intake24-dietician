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
                :title="element.title"
                :subtitle="element.selected ? 'enabled' : 'disabled'"
                :value="element.value"
                :active="element.value === selectedModule"
                rounded="xl"
                class="ma-2"
                @click="() => handleModuleSelect(element.title)"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-drag"></v-icon>
                </template>
                <template v-slot:append>
                  <v-switch
                    v-model:model-value="element.selected"
                    class="d-flex align-center justify-center"
                    color="success"
                  ></v-switch>
                </template>
              </v-list-item>
            </template>
          </draggable>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'

const emit = defineEmits<{
  update: [value: ReturnType<typeof defineComponent>]
}>()

const route = useRoute()

const drag = ref(false)

const items = ref([
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
])

const selectedModule = ref(1)

onMounted(() => {
  const currentRoute = route.path.split('/').pop() ?? ''
  selectedModule.value =
    items.value.find(i => i.to.includes(currentRoute))?.value ?? 1
})

const handleModuleSelect = (title: string) => {
  const item = items.value.find(i => i.title === title)

  if (!item) return
  selectedModule.value = item.value
  emit('update', item.to)
}

watch(selectedModule, newVal => console.log(newVal))
</script>
