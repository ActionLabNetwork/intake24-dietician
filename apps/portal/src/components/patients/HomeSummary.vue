<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div>
      <p class="font-weight-medium">Summary</p>
      <v-card class="d-flex flex-wrap mt-2 py-2 px-4 elevation-1">
        <div>
          Total patients:
          <span class="font-weight-bold">{{ summary.total }}</span>
        </div>
        <div>
          Active: <span class="font-weight-bold">{{ summary.active }}</span>
        </div>
        <div>
          Archived: <span class="font-weight-bold">{{ summary.archived }}</span>
        </div>
      </v-card>
    </div>
    <div>
      <v-btn
        color="primary"
        class="text-capitalize"
        append-icon="mdi-plus"
        to="/dashboard/my-patients/add-patient"
      >
        Add new patient
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Summary } from '@intake24-dietician/portal/views/dashboard/patients/Patients.vue'

defineProps<{ summary: Summary }>()
</script>

<style scoped lang="scss">
.d-flex {
  gap: 3rem;

  v-card {
    background: white;
    width: fit-content;
  }
}
</style>
