<template>
  <div class="d-flex align-center mt-8 mb-4">
    <v-icon icon="mdi-note-text-outline" class="mr-2"></v-icon>
    <p>Drafts</p>
    <!-- <pre>{{ feedbackDraftsQuery.data.value }}</pre> -->
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
      <div v-else>
        <div v-for="draft in feedbackDraftsQuery.data.value" :key="draft.id">
          <DraftItem
            :created="moment(draft.createdAt).format(dateFormat)"
            :modified="moment(draft.updatedAt).format(dateFormat)"
            class="mb-4"
            @button-click="() => handleDraftItemButtonClick(draft.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import moment from 'moment'
import DraftItem from '@/components/patients/feedback-records/DraftItem.vue'
import { useFeedbackDraftsByPatientId } from '@intake24-dietician/portal/queries/useFeedback'
import { useRoute, useRouter } from 'vue-router'
import BaseProgressCircular from '../../common/BaseProgressCircular.vue'

const dateFormat = 'MMMM Do YYYY, h:mm:ss a'

const router = useRouter()
const route = useRoute()

const patientId = route.params['patientId'] as string
console.log({ patientId })
const feedbackDraftsQuery = useFeedbackDraftsByPatientId(Number(patientId))

const handleDraftItemButtonClick = (draftId: number) => {
  console.log('Button clicked')
  router.push({
    name: 'Survey Patient Edit Draft Feedback',
    params: { patientId, feedbackId: draftId },
  })
}
</script>
