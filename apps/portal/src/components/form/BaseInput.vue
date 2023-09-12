<template>
  <div class="d-flex flex-column">
    <div class="form-label pl-2 pb-2">
      <slot />
    </div>
    <v-text-field
      :type="type"
      variant="solo-filled"
      density="comfortable"
      :append-inner-icon="suffixIcon"
      @click:append-inner="handleIconClick"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: HTMLInputElement['type']
  suffixIcon?: string
  handleIconClick?: () => void
}>()
</script>

<style>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
