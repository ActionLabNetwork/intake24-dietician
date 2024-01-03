<template>
  <v-card class="mx-auto py-2 px-5">
    <div class="d-flex justify-space-between align-center">
      <div>
        <p>
          <span class="font-weight-medium">Created:</span>
          {{ created }}
        </p>
        <p>
          <span class="font-weight-medium">Modified:</span>
          {{ modified }}
        </p>
      </div>
      <div>
        <v-btn
          class="text-capitalize"
          color="primary"
          @click="$emit('buttonClick')"
        >
          Edit draft
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
interface DraftItem {
  created: string
  modified: string
}

defineProps<DraftItem>()
defineEmits<{ buttonClick: [] }>()
</script>
