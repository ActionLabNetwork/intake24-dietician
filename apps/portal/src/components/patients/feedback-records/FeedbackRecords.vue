<template>
  <v-row>
    <v-col>
      <p class="title">Feedback records</p>
      <DraftItemList />
      <v-divider class="my-14" />
      <SharedItemList />
    </v-col>
    <v-col-2>
      <v-btn append-icon="mdi-plus" color="primary" class="text-none"
        >Compose new feedback
      </v-btn>
    </v-col-2>
  </v-row>
  <div class="d-flex justify-space-between"></div>
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
