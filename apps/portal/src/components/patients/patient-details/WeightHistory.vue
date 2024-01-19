<template>
  <BaseInput
    type="number"
    name="weight"
    :value="props.modelValue.at(-1)?.weight ?? 0"
    class="base-input"
    suffix="kg"
    @update="(newVal: string) => onWeightEdit(parseInt(newVal))"
  >
    <v-row justify="space-between" class="pa-3">
      <span class="input-label">Weight:</span>
      <v-btn variant="plain" size="x-small" @click="isDialogOpen = true">
        History
      </v-btn>
    </v-row>
  </BaseInput>

  <v-dialog v-model="isDialogOpen" max-width="500">
    <v-card title="Weight History">
      <v-data-table
        :headers="tableHeaders"
        :items="previousEntries"
        density="compact"
        no-data-text="No previous records"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.columns.weight }}</td>
            <td>{{ moment(item.columns.timestamp).format('DD/MM/YYYY') }}</td>
            <td>
              <v-btn
                icon="mdi-minus"
                variant="text"
                class="ml-2"
                @click="removeHistoryByTimestamp(item.columns.timestamp)"
              />
            </td>
          </tr>
        </template>
        <template #bottom></template>
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseInput from '../../form/BaseInput.vue'
import moment from 'moment'

type WeightHistory = {
  timestamp: Date
  weight: number
}[]

const props = defineProps<{
  modelValue: WeightHistory
}>()

const emit = defineEmits<{
  update: [value: WeightHistory]
}>()

const isDialogOpen = ref(false)
const isWeightEdited = ref(false)

const onWeightEdit = (weight: number) => {
  if (weight === props.modelValue.at(-1)?.weight) return
  const newEntry = { weight, timestamp: new Date() }
  if (isWeightEdited.value) {
    emit('update', [...props.modelValue.slice(0, -1), newEntry])
  } else {
    emit('update', [...props.modelValue, newEntry])
    isWeightEdited.value = true
  }
}

const removeHistoryByTimestamp = (timestamp: Date) => {
  emit(
    'update',
    props.modelValue.filter(entry => entry.timestamp !== timestamp),
  )
}

const tableHeaders = [
  {
    title: 'Weight (kg)',
    key: 'weight',
    order: 'desc',
    width: '40px',
  },
  {
    title: 'Date',
    key: 'timestamp',
    width: '80px',
  },
  {
    title: '',
    key: 'delete',
    width: '20px',
  },
]

const previousEntries = computed(() => props.modelValue.slice(0, -1))
</script>

<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
