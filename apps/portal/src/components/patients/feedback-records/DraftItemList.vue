<template>
  <div class="d-flex align-center mt-8 mb-4">
    <v-icon icon="mdi-note-text-outline" class="mr-2"></v-icon>
    <p>Drafts</p>
  </div>
  <div>
    <span v-if="feedbackDraftsQuery.isPending.value">
      <BaseProgressCircular />
    </span>
    <span v-else-if="feedbackDraftsQuery.isError.value">
      Failed to fetch drafts
    </span>
    <div v-else-if="feedbackDraftsQuery.data">
      <div v-if="feedbackDraftsQuery.data.value?.length === 0">No drafts</div>
      <div
        v-else
        class="d-flex flex-column justify-space-between drafts-container"
      >
        <div v-for="draft in feedbackDraftsQuery.data.value" :key="draft.id">
          <DraftItem
            :draft-id="draft.id"
            :modified="moment(draft.updatedAt).format(dateFormat)"
            :recall-dates="
              draft.draft.recallDaterange.map(date =>
                moment(date).format(dateRangeFormat),
              )
            "
            @button-click="() => handleDraftItemButtonClick(draft.id)"
          />
        </div>
        <v-pagination
          v-if="feedbackDraftsCountQuery.data.value"
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
import moment from 'moment'
import DraftItem from '@/components/patients/feedback-records/DraftItem.vue'
import {
  useFeedbackDraftsByPatientId,
  useFeedbackDraftsCountByPatientId,
} from '@intake24-dietician/portal/queries/useFeedback'
import { useRoute, useRouter } from 'vue-router'
import BaseProgressCircular from '../../common/BaseProgressCircular.vue'
import { computed, ref } from 'vue'

const dateFormat = 'D MMM, h:mm a'
const dateRangeFormat = 'D MMM'
const paginationLimit = 3

const router = useRouter()
const route = useRoute()

const patientId = route.params['patientId'] as string
const page = ref(1)

const feedbackDraftsQuery = useFeedbackDraftsByPatientId(
  Number(patientId),
  page,
)

const feedbackDraftsCountQuery = useFeedbackDraftsCountByPatientId(
  Number(patientId),
)

const paginationLength = computed(() => {
  return Math.ceil((feedbackDraftsCountQuery.data.value ?? 0) / paginationLimit)
})

const handleDraftItemButtonClick = (draftId: number) => {
  router.push({
    name: 'Survey Patient Edit Draft Feedback',
    params: {
      surveyId: route.params['surveyId'],
      patientId,
      feedbackId: draftId,
    },
  })
}
</script>

<style scoped>
.drafts-container {
  min-height: 30vh;
}
</style>
