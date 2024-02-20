<template>
  <BaseDialog v-model="dialog" :on-confirm="props.onConfirm">
    <template #title> Clinic settings changed </template>
    <template #default>
      Are you sure you want make changes to your clinic? Changes will only apply
      to new patients added to this clinic.
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
