<template>
  <v-card class="mx-auto py-2 px-5">
    <div class="d-flex justify-space-between align-center">
      <div class="d-flex align-center justify-center">
        <div>
          <p>
            <span class="font-weight-medium">Shared:</span>
            {{ shared }}
          </p>
        </div>
        <div class="ml-2">
          <v-chip
            variant="outlined"
            :color="shareType === 'Tailored' ? 'success' : 'warning'"
            :text="shareType"
          >
          </v-chip>
        </div>
      </div>
      <div>
        <v-btn
          append-icon="mdi-eye-off-outline"
          class="text-capitalize"
          variant="text"
        >
          Hide
        </v-btn>
        <v-btn
          class="text-capitalize ml-8"
          color="primary"
          @click="$emit('buttonClick')"
        >
          View
        </v-btn>
        <v-icon icon="mdi-download-outline" class="ml-5" />
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
interface SharedItem {
  shared: string
  shareType: 'Tailored' | 'Auto'
}

defineProps<SharedItem>()
defineEmits<{ buttonClick: [] }>()
</script>
