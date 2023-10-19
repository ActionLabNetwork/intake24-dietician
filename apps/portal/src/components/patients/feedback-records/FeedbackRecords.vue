<template>
  <p class="title">Feedback records</p>
  <DraftItemList />
  <v-divider class="my-14" />
  <SharedItemList />
</template>
<script setup lang="ts">
import DraftItemList from '@/components/patients/feedback-records/DraftItemList.vue'
import SharedItemList from './SharedItemList.vue'
// import DraftItem from './DraftItem.vue'
</script>

<style scoped lang="scss">
.title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
