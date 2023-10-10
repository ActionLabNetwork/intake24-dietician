<template>
  <div class="d-flex flex-column">
    <div class="form-label pl-2 pb-2">
      <slot />
    </div>
    <v-text-field
      flat
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      variant="solo-filled"
      density="comfortable"
      :append-inner-icon="suffixIcon"
      :append-icon="suffixIconOuter"
      :name="name"
      :model-value="value"
      :rules="rules"
      :readonly="readonly"
      @input="updateValue"
      @click:append-inner="handleIconClick"
      @click:append="handleOuterIconClick"
    >
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: HTMLInputElement['type']
  placeholder?: string
  autocomplete?: HTMLInputElement['autocomplete']
  suffixIcon?: string
  suffixIconOuter?: string
  name?: string
  value?: HTMLInputElement['value']
  rules?: ((value: string) => boolean | string)[]
  readonly?: boolean
  handleIconClick?: () => void
  handleOuterIconClick?: () => void
}>()
const emit = defineEmits<{ update: [value: string] }>()
const updateValue = (e: InputEvent) => {
  emit('update', (e.target as HTMLInputElement).value)
}
</script>

<style>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
