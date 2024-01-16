<template>
  <v-card v-if="patientQuery" :loading="patientQuery.isPending">
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
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PatientNavItems from './PatientNavItems.vue'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'

const route = useRoute()

const patientStore = usePatientStore()
patientStore.patientId = route.params['patientId'] as string

const patientQuery = computed(() => patientStore.patientQuery)

const paddedId = computed(() => {
  return ((route.params['patientId'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
})

const fullName = computed(() => {
  const firstName = patientQuery.value.data?.firstName ?? ''
  const lastName = patientQuery.value.data?.lastName ?? ''

  return `${firstName} ${lastName}`
})

const avatar = computed(() => {
  return patientQuery.value.data?.avatar ?? getDefaultAvatar()
})
</script>
