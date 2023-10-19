<template>
  <div class="d-flex align-center mt-8 mb-4">
    <v-icon icon="mdi-note-text-outline" class="mr-2"></v-icon>
    <p>Drafts</p>
  </div>
  <DraftItem />
</template>
<script setup lang="ts">
import DraftItem from '@/components/patients/feedback-records/DraftItem.vue'

interface DraftItem {
  created: string
  modified: string
}
</script>
