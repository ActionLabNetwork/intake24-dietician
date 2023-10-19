<template>
  <v-card class="mx-auto py-2 px-5">
    <div class="d-flex justify-space-between align-center">
      <div class="d-flex align-center justify-center">
        <div>
          <p>
            <span class="font-weight-medium">Shared:</span>
            {{ items[0]!.shared }}
          </p>
        </div>
        <div class="ml-2">
          <v-chip
            variant="outlined"
            :color="items[0]!.type === 'Tailored' ? 'success' : 'warning'"
            :text="items[0]!.type"
          >
          </v-chip>
        </div>
      </div>
      <div>
        <v-btn append-icon="mdi-eye-off-outline" class="text-capitalize" variant="text"> Hide </v-btn>
        <v-btn class="text-capitalize ml-8" color="primary">View</v-btn>
        <v-icon icon="mdi-download-outline" class="ml-5" />
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'

interface SharedItem {
  shared: string
  type: 'Tailored' | 'Auto'
}

const items = ref<SharedItem[]>([
  { shared: 'Real-Time', type: 'Tailored' },
  { shared: 'Audience', type: 'Tailored' },
  { shared: 'Conversions', type: 'Auto' },
])
</script>
