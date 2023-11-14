<template>
  <v-card :loading="patientQuery.isLoading.value" max-width="fit-content">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="orange"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>
    <v-card-item>
      <v-card-title class="text-center">
        <v-avatar size="x-large" :image="avatar ?? ''" />
        <p class="title text-md mt-4">{{ fullName }}</p>
      </v-card-title>
      <v-card-subtitle class="text-center">
        ID: {{ paddedId }}
      </v-card-subtitle>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'
import { usePatientById } from '@/queries/usePatients'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'

const route = useRoute()
const patientQuery = usePatientById(route.params['id'] as string)

const paddedId = computed(() => {
  return ((route.params['id'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
})

const fullName = computed(() => {
  const firstName =
    patientQuery.data.value?.data.data.patientProfile?.firstName ?? ''
  const lastName =
    patientQuery.data.value?.data.data.patientProfile?.lastName ?? ''

  return `${firstName} ${lastName}`
})

const avatar = computed(() => {
  return (
    patientQuery.data.value?.data.data.patientProfile?.avatar ??
    getDefaultAvatar('')
  )
})

const navItems = [
  {
    title: 'Feedback records',
    value: 'feedbackRecords',
    to: `/dashboard/my-patients/patient-records/${route.params['id']}/feedback-records`,
  },
  {
    title: 'Patient details',
    value: 'patientDetails',
    to: `/dashboard/my-patients/patient-records/${route.params['id']}/patient-details`,
  },
  {
    title: 'Patient recalls',
    value: 'patientRecalls',
    to: `/dashboard/my-patients/patient-records/${route.params['id']}/patient-recalls`,
  },
]
</script>

<style scoped lang="scss">
$gray: #d9d9d9;

.title {
  font-size: 1.125rem;
}
</style>
