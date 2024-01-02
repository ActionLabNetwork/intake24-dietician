<template>
  <v-row>
    <v-col class="pt-1">
      <div class="d-flex flex-column flex-sm-row justify-space-between">
        <p class="title mb-3 mb-sm-0">Feedback records</p>
        <v-btn
          append-icon="mdi-plus"
          color="primary"
          class="text-none"
          :to="`${route.fullPath}/compose-feedback`"
          :disabled="!recallsStore.hasRecalls"
        >
          {{
            recallsStore.hasRecalls
              ? 'Compose new feedback'
              : 'No recalls available'
          }}
        </v-btn>
      </div>

      <DraftItemList />
      <v-divider class="my-14" />
      <SharedItemList />
    </v-col>
  </v-row>
  <div class="d-flex justify-space-between"></div>
</template>
<script setup lang="ts">
import DraftItemList from '@/components/patients/feedback-records/DraftItemList.vue'
import SharedItemList from './SharedItemList.vue'
import { useRoute } from 'vue-router'
import { useRecallsStore } from '@intake24-dietician/portal/stores/recall'
// import DraftItem from './DraftItem.vue'

const route = useRoute()
const recallsStore = useRecallsStore()
</script>

<style scoped lang="scss">
.title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
