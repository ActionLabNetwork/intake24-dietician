<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card v-if="patient" class="mx-auto py-2 px-5">
    <div class="d-flex flex-wrap justify-space-between align-center">
      <!-- Profile avatar, name and id -->
      <div class="d-flex align-center">
        <v-avatar
          size="x-large"
          :image="patient.avatar ?? getDefaultAvatar()"
        />
        <div class="ml-3">
          <div class="font-weight-bold">{{ patientStore.fullName }}</div>
          <div>ID: {{ patient.id }}</div>
        </div>
      </div>

      <!-- Date -->
      <div class="d-flex justify-center">
        <div class="d-flex align-center">
          <div class="font-weight-medium">Date:</div>
          <VueDatePicker
            v-model="dateRange"
            :disabled="disableDatepicker"
            :teleport="true"
            :enable-time-picker="false"
            :allowed-dates="allowedStartDates"
            text-input
            range
            format="dd/MM/yyyy"
            class="ml-2"
            style="min-width: 15.8rem"
            @update:model-value="handleDaterangeUpdate"
          />
        </div>
      </div>

      <!-- Share status -->
      <div class="d-flex flex-column align-center">
        <p class="font-weight-medium mx-auto">Share status</p>
        <v-chip variant="outlined" color="success" text="Tailored"> </v-chip>
      </div>

      <!-- Action buttons -->
      <div v-if="!hideActionButtons">
        <v-btn
          :append-icon="previewing ? 'mdi-pencil-outline' : 'mdi-eye-outline'"
          class="text-capitalize"
          variant="text"
          @click="emit('click:preview')"
        >
          {{ previewing ? 'Edit' : 'Preview' }}
        </v-btn>
        <v-btn
          class="text-none ml-8"
          variant="outlined"
          :loading="
            saveDraftMutation.isPending.value ||
            editDraftMutation.isPending.value
          "
          :disabled="!!editingDraft && areDraftsEqual"
          @click="showDialog(editingDraft ? 'edit' : 'save')"
        >
          {{
            props.editingDraft
              ? areDraftsEqual
                ? 'No draft changes'
                : 'Save draft changes'
              : 'Save as draft'
          }}
        </v-btn>
        <v-btn
          class="text-none ml-3"
          :loading="
            shareDraftMutation.isPending.value &&
            !shareDraftMutation.isError.value
          "
          color="primary"
          variant="flat"
          @click="showDialog('share')"
        >
          Share feedback
        </v-btn>
      </div>
    </div>
  </v-card>
  <DialogRouteLeave :unsaved-changes="!areDraftsEqual && !isSubmitting" />
  <DialogFeedbackEdit
    v-if="!!editingDraft"
    v-model="confirmEditDialog"
    :on-confirm="handleEditDraftClick"
  />
  <DialogFeedbackSave
    v-if="!editingDraft"
    v-model="confirmSaveDialog"
    :on-confirm="handleSaveDraftClick"
  />
  <DialogFeedbackShare
    v-model="confirmShareDialog"
    v-model:send-mode="sendMode"
    :download-url="downloadUrl"
    :full-name="patientStore.fullName"
    :on-confirm="handleShareDraftClick"
  />
</template>
<script setup lang="ts">
import {
  DraftCreateDto,
  FeedbackType,
} from '@intake24-dietician/common/entities-new/feedback.dto'
import {
  useEditDraft,
  useSaveDraft,
  useShareDraft,
} from '@intake24-dietician/portal/mutations/useFeedback'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import isEqual from 'lodash.isequal'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DialogRouteLeave from '../common/DialogRouteLeave.vue'
import DialogFeedbackShare from './DialogFeedbackShare.vue'

import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import DialogFeedbackEdit from './DialogFeedbackEdit.vue'
import DialogFeedbackSave from './DialogFeedbackSave.vue'
import moment from 'moment'

const props = withDefaults(
  defineProps<{
    initialDateRange: [Date | undefined, Date | undefined]
    previewing: boolean
    editingDraft: { originalDraft: DraftCreateDto } | false
    draftId?: number
    draft: DraftCreateDto
    disableDatepicker?: boolean
    hideActionButtons?: boolean
    feedbackType: FeedbackType
    useUrlAsState?: boolean
  }>(),
  {
    draftId: undefined,
    disableDatepicker: false,
    hideActionButtons: false,
    useUrlAsState: false,
  },
)
const emit = defineEmits<{
  'update:daterange': [date: [Date | undefined, Date | undefined]]
  'click:preview': []
  'update:draft': []
}>()

const router = useRouter()
const route = useRoute()
const $toast = useToast()

const patientStore = usePatientStore()
const recallStore = useRecallStore()

const { allowedStartDates } = storeToRefs(recallStore)

const patient = computed(() => patientStore.patientQuery.data)
const downloadUrl = computed(() => {
  const baseUrl = window.location.origin
  const url = new URL(`${baseUrl}${route.fullPath}`)
  const params = url.searchParams
  params.set('preview', 'true')

  return url.toString()
})

// Mutations
const saveDraftMutation = useSaveDraft()
const editDraftMutation = useEditDraft()
const shareDraftMutation = useShareDraft()

const isSubmitting = ref(false)
const dateRange = ref()
const confirmEditDialog = ref(false)
const confirmSaveDialog = ref(false)
const confirmShareDialog = ref(false)

const modes = [
  { label: 'Automated', value: 'automated' },
  { label: 'Manual', value: 'manual' },
] as const
const sendMode = ref<(typeof modes)[number]['value']>('automated')

const handleDaterangeUpdate = (
  newDaterange: [Date | undefined, Date | undefined],
) => {
  router.replace({
    query: {
      ...route.query,
      dateFrom: newDaterange[0] && moment(newDaterange[0]).format('YYYYMMDD'),
      dateTo: newDaterange[1] && moment(newDaterange[1]).format('YYYYMMDD'),
    },
  })
  dateRange.value = newDaterange
  emit('update:daterange', newDaterange)
}

const areDraftsEqual = computed(() => {
  if (!props.editingDraft) return false
  return isEqual(props.editingDraft.originalDraft, props.draft)
})

onMounted(() => {
  dateRange.value = recallStore.selectedRecallDateRange
  isSubmitting.value = false
  if (
    props.useUrlAsState &&
    (route.query['dateFrom'] || route.query['dateTo'])
  ) {
    const newDateRange: [Date | undefined, Date | undefined] = [
      route.query['dateFrom']
        ? moment(route.query['dateFrom'] as string, 'YYYYMMDD').toDate()
        : undefined,
      route.query['dateTo']
        ? moment(route.query['dateTo'] as string, 'YYYYMMDD').toDate()
        : undefined,
    ]
    dateRange.value = newDateRange
    emit('update:daterange', newDateRange)
  }
})

const showDialog = (dialog: 'edit' | 'save' | 'share') => {
  if (dialog === 'edit') {
    confirmEditDialog.value = true
  } else if (dialog === 'save') {
    confirmSaveDialog.value = true
  } else if (dialog === 'share') {
    confirmShareDialog.value = true
  }
}

const handleSaveDraftClick = async () => {
  isSubmitting.value = true
  await saveDraftMutation.mutateAsync(
    {
      patientId: Number(patient.value?.id),
      draft: props.draft,
    },
    {
      onSuccess: () => {
        $toast.success('Draft saved')
        router.push({
          name: 'Survey Patient Feedback Records',
          params: {
            surveyId: route.params['surveyId'],
            patientId: route.params['patientId'],
          },
        })
      },
    },
  )
}

const handleEditDraftClick = async () => {
  await editDraftMutation.mutateAsync(
    {
      draftId: Number(route.params['feedbackId'] as string),
      draft: props.draft,
    },
    {
      onSuccess: () => {
        $toast.success('Draft updated')
        emit('update:draft')
      },
    },
  )
}

const handleShareDraftClick = async () => {
  isSubmitting.value = true

  if (route.query['preview'] !== 'false') {
    router.replace({ query: { preview: 'true' } })
  }

  await shareDraftMutation.mutateAsync(
    {
      patientId: Number(patient.value?.id),
      draftId: props.draftId,
      draft: props.draft,
      url: downloadUrl.value,
      sendAutomatedEmail: sendMode.value === 'automated',
    },
    {
      onSuccess: () => {
        $toast.success('Draft shared')
        router.push({
          name: 'Survey Patient Feedback Records',
          params: {
            surveyId: route.params['surveyId'],
            patientId: route.params['patientId'],
          },
        })
      },
    },
  )
}
</script>

<style scoped lang="scss">
@media (max-width: 1440px) {
  .flex-container {
    justify-content: center;
  }
}
</style>
