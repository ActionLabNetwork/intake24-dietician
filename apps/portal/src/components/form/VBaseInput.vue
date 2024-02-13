<template>
  <div class="d-flex flex-column">
    <div :class="['form-label pb-2', labelClass]">
      <slot />
    </div>
    <div v-if="type === 'tel'">
      <v-phone-input
        v-model="fieldValue"
        label=""
        country-label=""
        country-icon-mode="svg"
        density="compact"
        :invalid-message="
          `Invalid mobile number for ${country}` || errorMessage
        "
        guess-country
        default-country="AU"
        :phone-props="{
          flat: true,
          variant: 'solo-filled',
          density: 'comfortable',
        }"
        :country-props="{
          flat: true,
          variant: 'solo-filled',
          density: 'comfortable',
        }"
        @update:country="country = $event"
      />
    </div>
    <div
      v-else-if="type === 'select'"
      :style="bordered ? 'background: white' : ''"
      :class="{
        'pa-3 my-3 d-flex rounded-lg elevation-1': bordered,
      }"
    >
      <v-row>
        <v-col cols="6">
          <v-select
            v-model="fieldValue"
            flat
            density="comfortable"
            variant="solo-filled"
            :items="selectConfig?.items"
            :item-title="selectConfig?.itemTitle"
            :item-value="selectConfig?.itemValue"
            label="Select"
            :rules="rules ?? []"
            :readonly="readonly ?? false"
            :bordered="bordered"
            @update:model-value="updateValue"
          >
            <template #prepend-inner>
              <slot name="prepend-inner" />
            </template>
            <template v-if="$slots.prepend" #prepend>
              <slot name="prepend" />
            </template>
            <template #append-inner>
              <slot name="append-inner" />
            </template>
            <template #append>
              <slot name="append" />
            </template>
          </v-select>
        </v-col>
      </v-row>
    </div>
    <div
      v-else
      :style="bordered ? 'background: white' : ''"
      :class="{
        'pa-3 my-3 d-flex rounded-lg elevation-1': bordered,
      }"
    >
      <v-text-field
        v-model="fieldValue"
        flat
        :required="required ?? false"
        :type="type ?? 'text'"
        :placeholder="placeholder ?? ''"
        :error-messages="errorMessage"
        :autocomplete="autocomplete ?? 'off'"
        variant="solo-filled"
        density="default"
        :append-inner-icon="suffixIcon"
        :append-icon="suffixIconOuter"
        :name="name"
        :rules="rules ?? []"
        :readonly="readonly ?? false"
        :suffix="suffix"
        :bordered="bordered"
        :data-cy="dataCy"
        @update:model-value="updateValue"
        @click:append-inner="handleIconClick"
        @click:append="handleOuterIconClick"
      >
        <template #prepend-inner>
          <slot name="prepend-inner" />
        </template>
        <template v-if="$slots.prepend" #prepend>
          <slot name="prepend" />
        </template>
        <template #append-inner>
          <slot name="append-inner" />
        </template>
        <template #append>
          <slot name="append" />
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VPhoneInput } from 'v-phone-input'
import 'v-phone-input/dist/v-phone-input.css'
import 'flag-icons/css/flag-icons.min.css'
import { ref } from 'vue'
import { useField } from 'vee-validate'

const props = defineProps<{
  name: string
  type?: HTMLInputElement['type']
  placeholder?: string
  autocomplete?: HTMLInputElement['autocomplete']
  suffix?: string
  suffixIcon?: string
  suffixIconOuter?: string
  value?: string | number
  rules?: ((value: string) => boolean | string)[]
  readonly?: boolean
  labelClass?: string
  required?: boolean
  bordered?: boolean
  dataCy?: string
  selectConfig?: {
    items: readonly any[]
    itemTitle: string
    itemValue: string
  }
  handleIconClick?: () => void
  handleOuterIconClick?: () => void
}>()

// TODO: Investigate further this weird ts error
// @ts-ignore
const { value: fieldValue, errorMessage } = useField<string>(() => props.name)

if (props.type !== 'tel' && typeof props.value === 'string') {
  fieldValue.value = props.value ?? ''
}
const emit = defineEmits<{
  update: [value: string]
}>()
const updateValue = (value: string) => {
  emit('update', value)
}
const country = ref('AU')
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
