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
        <v-list nav>
          <v-list-item
            v-for="item in navItems"
            :key="item.value"
            :title="item.title"
            :to="item.to"
            align="center"
          />
        </v-list>
      </v-card-actions>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'

const navItems = [
  {
    title: 'Feedback records',
    value: 'feedbackRecords',
    to: '/dashboard/my-patients/patient-records/feedback-records',
  },
  {
    title: 'Patient details',
    value: 'patientDetails',
    to: '/dashboard/my-patients/patient-records/patient-details',
  },
]
</script>

<style scoped lang="scss">
$gray: #d9d9d9;

.title {
  font-size: 1.125rem;
}
</style>
