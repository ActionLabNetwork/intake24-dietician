<template>
  <BaseDialog
    v-model="dialogVisible"
    :on-confirm="dialog.handleDialogConfirm"
    :on-cancel="dialog.handleDialogCancel"
  >
    <template #title> Attention! </template>
    You still have unsaved changes. Are you sure you want to leave the page?
  </BaseDialog>
</template>

<script setup lang="ts">
import { useLeaveGuard } from '@intake24-dietician/portal/composables/useLeaveGuard'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseDialog from './BaseDialog.vue'

const props = defineProps<{ unsavedChanges: boolean }>()

const router = useRouter()

const dialogVisible = ref(false)
const dialog = {
  show: () => {
    dialogVisible.value = true
  },
  close: () => {
    dialogVisible.value = false
  },
  handleDialogConfirm: () => {
    leaveGuard.switchOffGuard()
    router.push(leaveGuard.destinationRoute.value)
  },
  handleDialogCancel: () => {
    dialog.close()
  },
}
// eslint-disable-next-line vue/no-setup-props-destructure
const leaveGuard = useLeaveGuard(dialog.show, props.unsavedChanges)

watch(
  () => props.unsavedChanges,
  newValue => {
    console.log({ newValue })
    leaveGuard._unsavedChanges.value = newValue
  },
)
</script>
