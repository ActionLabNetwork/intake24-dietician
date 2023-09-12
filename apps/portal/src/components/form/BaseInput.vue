<template>
  <div class="d-flex flex-column">
    <div class="form-label pl-2 pb-2">
      <slot />
    </div>
    <v-text-field variant="solo-filled" density="comfortable" />
  </div>
</template>

<style>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
