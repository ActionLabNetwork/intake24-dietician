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
        <v-btn class="text-none" @click="handleCancel"> Cancel </v-btn>
        <BaseButton ref="confirmBtn" variant="flat" @click="handleConfirm">
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
  onConfirm?: Function
  onCancel?: Function
}>()

const dialog = defineModel<boolean>()
const confirmBtn = ref()

const handleConfirm = () => {
  if (props.onConfirm) {
    props.onConfirm()
  }
  closeDialog()
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
