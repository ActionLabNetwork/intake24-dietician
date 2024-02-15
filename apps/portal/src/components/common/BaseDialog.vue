<template>
  <v-dialog v-model="dialog" width="500px">
    <v-card>
      <v-card-title class="pl-5 pt-5">
        <slot name="title"></slot>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="text-none" @click="handleCancel">
          {{ onCancelText ?? 'Cancel' }}
        </v-btn>
        <BaseButton
          v-if="onConfirm"
          ref="confirmBtn"
          variant="flat"
          :loading="isLoading"
          @click="handleConfirm"
        >
          Confirm
        </BaseButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  modelValue: boolean
  onConfirm?: () => Promise<void>
  onCancel?: Function
  onCancelText?: string
}>()

const dialog = defineModel<boolean>()
const isLoading = ref(false)
const confirmBtn = ref()

const handleConfirm = async () => {
  if (props.onConfirm) {
    isLoading.value = true
    await props.onConfirm()
    isLoading.value = false
  }
  if (!isLoading.value) {
    closeDialog()
  }
}

const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
  closeDialog()
}

const closeDialog = () => {
  dialog.value = false
}
</script>
