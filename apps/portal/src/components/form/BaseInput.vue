<template>
  <div class="d-flex flex-column">
    <div :class="['form-label pb-2', labelClass]">
      <slot />
    </div>
    <div
      :style="bordered ? 'background: white' : ''"
      :class="{ 'pa-3 my-2 d-flex rounded-lg elevation-1': bordered }"
    >
      <v-phone-input
        v-if="type === 'tel'"
        :model-value="value?.toString()"
        label=""
        country-label=""
        country-icon-mode="svg"
        density="compact"
        guess-country
        @update:model-value="(value: string) => emit('update', value)"
      />
      <v-text-field
        v-else
        flat
        :required="required ?? false"
        :type="type ?? 'text'"
        :placeholder="placeholder ?? ''"
        :autocomplete="autocomplete ?? 'off'"
        variant="solo-filled"
        density="comfortable"
        :append-inner-icon="suffixIcon"
        :append-icon="suffixIconOuter"
        :name="name"
        :model-value="value"
        :rules="rules ?? []"
        :readonly="readonly ?? false"
        :suffix="suffix"
        :bordered="bordered"
        :data-cy="dataCy"
        @update:model-value="updateValue"
        @click:append-inner="handleIconClick"
        @click:append="handleOuterIconClick"
      >
      </v-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VPhoneInput } from 'v-phone-input'
import 'v-phone-input/dist/v-phone-input.css'
import 'flag-icons/css/flag-icons.min.css'

defineProps<{
  type?: HTMLInputElement['type']
  placeholder?: string
  autocomplete?: HTMLInputElement['autocomplete']
  suffix?: string
  suffixIcon?: string
  suffixIconOuter?: string
  name?: string
  value?: string | number
  rules?: ((value: string) => boolean | string)[]
  readonly?: boolean
  labelClass?: string
  required?: boolean
  bordered?: boolean
  dataCy?: string
  emptyAsNull?: boolean
  handleIconClick?: () => void
  handleOuterIconClick?: () => void
}>()
const emit = defineEmits<{
  update: [value: string]
}>()
const updateValue = (value: string) => {
  emit('update', value)
}
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
