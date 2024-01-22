<template>
  <BaseDialog v-model="dialog" :on-confirm="props.onConfirm">
    <template #title> Saving feedback draft </template>
    <template #default>
      Are you sure you want to save the feedback as a draft?
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@intake24-dietician/portal/components/common/BaseDialog.vue'
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  onConfirm: Function
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
