<template>
  <div class="text-wrapper d-flex align-center justify-space-between flex-wrap">
    <div>
      <p class="text-h3 font-weight-medium">Hi {{ patientName }}</p>
      <p class="w-50 mt-4">
        Great job on completing your recall. Below, you can find a quick
        feedback based on your recall data submitted between
        <br />
        {{ recallDateRange[0]?.toDateString() }} -
        {{ recallDateRange[1]?.toDateString() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  patientName: string
  recallDateRange: [Date | undefined, Date | undefined]
}>()
</script>

<style scoped lang="scss">
.text-wrapper {
  padding: 5rem 5.5rem;
}

@media print {
  .text-wrapper {
    padding: 0 4.5rem;
  }
}
</style>
