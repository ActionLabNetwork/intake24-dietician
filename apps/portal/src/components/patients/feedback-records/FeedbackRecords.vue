<template>
  <v-row>
    <v-col class="pt-1">
      <div class="d-flex flex-column flex-sm-row justify-space-between">
        <p class="text-h6 mb-3 mb-sm-0">Feedback records</p>
        <v-btn
          append-icon="mdi-plus"
          color="primary"
          class="text-none"
          :to="`${route.fullPath}/compose-feedback`"
          :loading="recallStore.recallDatesQuery.isPending"
          :disabled="!recallStore.hasRecalls"
        >
          {{
            recallStore.hasRecalls
              ? 'Compose new feedback'
              : 'No recalls available'
          }}
        </v-btn>
      </div>
      <div>
        <DraftItemList />
      </div>

      <v-divider class="my-14" />
      <SharedItemList />
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import DraftItemList from '@/components/patients/feedback-records/DraftItemList.vue'
import SharedItemList from './SharedItemList.vue'
import { useRoute } from 'vue-router'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'

const route = useRoute()
const recallStore = useRecallStore()

const patientId = route.params['patientId'] as string

recallStore.fetchRecalls(patientId)
</script>

<style scoped lang="scss">
.title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
