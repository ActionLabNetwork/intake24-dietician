<template>
  <BaseDialog v-model="dialog" :on-confirm="props.onConfirm">
    <template #title> Updating profile details </template>
    <template #default>
      Are you sure you want to update your profile details?
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
