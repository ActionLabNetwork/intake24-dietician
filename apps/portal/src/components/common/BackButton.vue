<template>
  <v-btn
    prepend-icon="mdi-chevron-left"
    flat
    class="text-none pa-0"
    variant="text"
    @click="handleBackButtonClick"
  >
    Go Back
  </v-btn>
</template>

<script setup lang="ts">
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'

const clinicStore = useClinicStore()

const handleBackButtonClick = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    clinicStore.navigateToSurveyPatientList()
  }
}
</script>
