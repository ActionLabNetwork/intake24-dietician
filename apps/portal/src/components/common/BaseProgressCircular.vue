<template>
  <div class="mt-10 d-flex justify-center">
    <v-progress-circular
      color="primary"
      indeterminate
      :size="size ?? 45"
    ></v-progress-circular>
  </div>
</template>

<script setup lang="ts">
defineProps<{ size?: number }>()
</script>
