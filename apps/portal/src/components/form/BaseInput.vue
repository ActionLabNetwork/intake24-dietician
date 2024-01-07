<template>
  <div class="d-flex flex-column">
    <div :class="['form-label pb-2', labelClass]">
      <slot />
    </div>
    <div
      :style="bordered ? 'background: white' : ''"
      :class="{ 'pa-3 my-2 d-flex rounded-lg elevation-1': bordered }"
    >
      <v-text-field
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
        @input="updateValue"
        @click:append-inner="handleIconClick"
        @click:append="handleOuterIconClick"
      >
      </v-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { INPUT_DEBOUNCE_TIME } from '@intake24-dietician/portal/constants'
import { useDebounceFn } from '@vueuse/core'

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
  handleIconClick?: () => void
  handleOuterIconClick?: () => void
}>()
const emit = defineEmits<{ update: [value: string] }>()
const updateValue = useDebounceFn((e: InputEvent) => {
  emit('update', (e.target as HTMLInputElement).value)
}, INPUT_DEBOUNCE_TIME)
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
