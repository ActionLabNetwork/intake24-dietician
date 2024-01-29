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
        <BaseButton variant="flat" @click="handleConfirm">Confirm</BaseButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: Boolean,
  onConfirm: Function,
  onCancel: Function,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// eslint-disable-next-line vue/no-setup-props-destructure
const dialog = ref(props.modelValue)

const handleConfirm = () => {
  console.log('Confirming')
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

watch(
  () => props.modelValue,
  newValue => {
    dialog.value = newValue
  },
)

watch(
  () => dialog.value,
  newValue => {
    emit('update:modelValue', newValue)
  },
)

const closeDialog = () => {
  dialog.value = false
  emit('update:modelValue', dialog.value)
}
</script>
