<template>
  <v-card :loading="patientQuery.isPending.value">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="orange"
        height="4"
        indeterminate
      />
    </template>
    <v-card-item>
      <PatientProfileSummary
        :avatar="avatar"
        :full-name="fullName"
        :patientId="paddedId"
      />
      <v-divider class="border-opacity-100 my-2" />
      <PatientNavItems />
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import PatientProfileSummary from '@/components/patients/PatientProfileSummary.vue'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'
import { usePatientById } from '@/queries/usePatients'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PatientNavItems from './PatientNavItems.vue'

const route = useRoute()
const patientQuery = usePatientById(route.params['patientId'] as string)

const paddedId = computed(() => {
  return ((route.params['patientId'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
})

const fullName = computed(() => {
  const firstName = patientQuery.data.value?.firstName ?? ''
  const lastName = patientQuery.data.value?.lastName ?? ''

  return `${firstName} ${lastName}`
})

const avatar = computed(() => {
  return patientQuery.data.value?.avatar ?? getDefaultAvatar()
})
</script>
