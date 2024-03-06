<template>
  <div class="text-center font-weight-medium">
    <v-avatar size="x-large" :image="avatar" />
    <p class="text-h6 text-md mt-4">{{ fullName }}</p>
  </div>
  <v-card-subtitle class="text-center"> ID: {{ patientId }} </v-card-subtitle>
</template>

<script setup lang="ts">
defineProps<{
  avatar: string
  fullName: string
  patientId: string
}>()
</script>

<style scoped lang="scss">
.title {
  font-size: 1.125rem;
}
</style>
