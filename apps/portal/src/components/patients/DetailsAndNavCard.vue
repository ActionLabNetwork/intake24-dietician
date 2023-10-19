<template>
  <v-card>
    <v-card-item>
      <v-card-title class="text-center">
        <v-avatar size="x-large" :image="getDefaultAvatar('test')" />
        <p class="title text-md mt-4">Mira Workman</p>
      </v-card-title>
      <v-card-subtitle class="text-center">ID: 23459801</v-card-subtitle>
      <v-divider class="border-opacity-100 my-2"></v-divider>
      <v-card-actions class="d-flex flex-column">
        <v-btn class="text-capitalize w-100">Feedback records</v-btn>
        <v-btn class="text-capitalize w-100">Patient details</v-btn>
      </v-card-actions>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
</script>

<style scoped lang="scss">
$gray: #d9d9d9;

.title {
  font-size: 1.125rem;
}
</style>
