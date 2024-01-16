<template>
  <v-btn
    prepend-icon="mdi-chevron-left"
    flat
    class="text-none pa-0"
    variant="text"
    @click="handleBackButtonClick"
  >
    <slot>Go Back</slot>
  </v-btn>
</template>

<script setup lang="ts">
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'
import { useRouter } from 'vue-router'

const props = defineProps<{
  to?:
    | string
    | { name: string; params?: Record<string, string | string[] | undefined> }
}>()

const clinicStore = useClinicStore()
const router = useRouter()

const handleBackButtonClick = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      clinicStore.navigateToSurveyPatientList()
    }
  }
}
</script>
