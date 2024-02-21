<template>
  <BaseDialog v-model="dialog" :on-confirm="props.onConfirm">
    <template #title> Saving feedback draft </template>
    <template #default>
      Are you sure you want to share the feedback with
      <span class="font-weight-medium">{{ fullName }}</span
      >?
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@intake24-dietician/portal/components/common/BaseDialog.vue'

const props = defineProps<{
  modelValue: boolean
  fullName: string
  onConfirm: () => Promise<void>
}>()

const dialog = defineModel<boolean>()
</script>
