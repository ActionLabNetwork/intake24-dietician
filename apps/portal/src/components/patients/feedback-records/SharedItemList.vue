<template>
  <div class="d-flex align-center mt-8 mb-4">
    <v-icon icon="mdi-email-outline" class="mr-2"></v-icon>
    <p>Shared</p>
  </div>
  <div>
    <span v-if="feedbackSharesQuery.isPending.value">
      <BaseProgressCircular />
    </span>
    <span v-else-if="feedbackSharesQuery.isError.value">
      Failed to fetch shared feedbacks
    </span>
    <div v-else-if="feedbackSharesQuery.data">
      <div v-if="feedbackSharesQuery.data.value?.length === 0">
        No shared feedbacks
      </div>
      <div
        v-else
        class="d-flex flex-column justify-space-between shares-container"
      >
        <div v-for="shared in feedbackSharesQuery.data.value" :key="shared.id">
          <SharedItem
            :share-id="shared.id.toString()"
            :shared="moment(shared.createdAt).format(dateFormat)"
            :share-type="shared.shareType"
            class="mb-4"
            @button-click="() => handleViewButtonClick(shared.id)"
          />
        </div>
        <v-pagination
          v-if="feedbackSharesCountQuery.data.value"
          v-model="page"
          class="align-self-end"
          :length="paginationLength"
          :total-visible="paginationLength"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  useFeedbackSharesByPatientId,
  useFeedbackSharesCountByPatientId,
} from '@intake24-dietician/portal/queries/useFeedback'
import moment from 'moment'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseProgressCircular from '../../common/BaseProgressCircular.vue'
import SharedItem from './SharedItem.vue'

const dateFormat = 'D MMM YYYY, h:mm a'
const paginationLimit = 3

const router = useRouter()
const route = useRoute()

const patientId = route.params['patientId'] as string
const page = ref(1)

const feedbackSharesQuery = useFeedbackSharesByPatientId(
  Number(patientId),
  page,
)

const feedbackSharesCountQuery = useFeedbackSharesCountByPatientId(
  Number(patientId),
)

const paginationLength = computed(() => {
  return Math.ceil((feedbackSharesCountQuery.data.value ?? 0) / paginationLimit)
})

const handleViewButtonClick = (shareId: number) => {
  router.push({
    name: 'Survey Patient View Shared Feedback',
    params: {
      surveyId: route.params['surveyId'],
      patientId,
      feedbackId: shareId,
    },
  })
}
</script>

<style scoped>
.shares-container {
  min-height: 30vh;
}
</style>
