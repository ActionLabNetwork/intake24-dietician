<template>
  <div class="text-wrapper d-flex align-center justify-space-between flex-wrap">
    <div>
      <p class="text-h3 font-weight-medium">Hi {{ patientName }}</p>
      <p class="w-50 mt-4">
        Great job on completing your recall. Below, you can find a quick
        feedback based on your recall data submitted on
        {{ recallDate }}
      </p>
    </div>
    <div class="my-5 ml-0 d-print-none">
      <v-btn
        class="text-none"
        color="secondary"
        flat
        @click="exportContentToPdf"
      >
        Export to PDF
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  patientName: string
  recallDate: string
  exportContentToPdf: Function
}>()
</script>

<style scoped lang="scss">
.text-wrapper {
  padding: 4.5rem 4.5rem;
}

@media print {
  .text-wrapper {
    padding: 0 4.5rem;
  }
}
</style>
