<template>
  <BaseDialog v-model="dialog" :on-confirm="props.onConfirm">
    <template #title> Saving feedback as draft </template>
    <template #default>
      Do you want to save the feedback document as draft?
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@intake24-dietician/portal/components/common/BaseDialog.vue'

const props = defineProps<{
  onConfirm: () => Promise<void>
}>()

const dialog = defineModel<boolean>()
</script>
