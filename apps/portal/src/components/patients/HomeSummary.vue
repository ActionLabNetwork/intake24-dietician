<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div>
      <p class="font-weight-medium">Summary</p>
      <v-card class="d-flex mt-2 py-2 px-4 elevation-1">
        <div>Total patients: <span class="font-weight-bold">5</span></div>
        <div>Active: <span class="font-weight-bold">3</span></div>
        <div>Archived: <span class="font-weight-bold">2</span></div>
      </v-card>
    </div>
    <div>
      <v-btn color="primary" class="text-capitalize" append-icon="mdi-plus">
        Add new patient
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Add logic to get the number of patients
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
