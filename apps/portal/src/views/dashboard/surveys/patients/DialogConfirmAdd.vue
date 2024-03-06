<template>
  <BaseDialog v-model="dialog" :on-confirm="props.onConfirm">
    <template #title>
      Adding a new patient to
      {{ clinicName }}
    </template>
    <template #default>
      Are you sure you want to add
      <span class="font-weight-medium">
        {{ fullName }}
      </span>
      to
      <span class="font-weight-medium">
        {{ clinicName }}
      </span>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@intake24-dietician/portal/components/common/BaseDialog.vue'
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  clinicName: string
  fullName: string
  modelValue: boolean
  onConfirm: () => Promise<void>
}>()
const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialog = ref(false)

onMounted(() => {
  dialog.value = props.modelValue
})

watch(
  () => props.modelValue,
  newValue => {
    dialog.value = newValue
  },
)

watch(
  () => dialog.value,
  newValue => {
    emits('update:modelValue', newValue)
  },
)
</script>
