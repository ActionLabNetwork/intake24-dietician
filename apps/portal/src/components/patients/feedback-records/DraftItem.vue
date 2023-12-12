<template>
  <v-card class="mx-auto py-2 px-5">
    <div class="d-flex justify-space-between align-center">
      <div>
        <p>
          <span class="font-weight-medium">Created:</span>
          {{ items[0]!.created }}
        </p>
        <p>
          <span class="font-weight-medium">Modified:</span>
          {{ items[0]!.modified }}
        </p>
      </div>
      <div>
        <v-btn class="text-capitalize" color="primary">Edit draft</v-btn>
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'

interface DraftItem {
  created: string
  modified: string
}

const items = ref<DraftItem[]>([
  { created: new Date().toDateString(), modified: new Date().toDateString() },
  { created: 'Audience', modified: new Date().toDateString() },
  { created: 'Conversions', modified: 'mdi-flag' },
])
</script>
