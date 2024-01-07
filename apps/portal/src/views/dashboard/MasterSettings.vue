<template>
  <div class="wrapper">
    <div v-if="!!surveyQuery.data.value" class="ma-0 pa-0">
      <BackButton class="ml-4" />
      <FeedbackModules
        :default-state="surveyQuery.data.value"
        :submit="handleSubmit"
        @update="handleFeedbackModulesUpdate"
      />
      <RecallReminders
        v-if="recallReminderProps"
        :default-state="recallReminderProps"
        @update="handleRecallRemindersUpdate"
      />
      <Notifications
        v-if="notificationsProps"
        :default-state="notificationsProps"
        @update="handleNotificationsUpdate"
      />
    </div>
    <div class="mt-10 ml-4">
      <p class="font-weight-medium">Review and save changes</p>
      <div class="text subheading">
        You have made changes to the master module setup. Review and confirm the
        changes before you proceed with adding patients or reviewing recall
        feedback
      </div>
      <v-btn color="primary" class="text-none mt-4" @click="handleSubmit">
        Review and confirm changes
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FeedbackModules from '@intake24-dietician/portal/components/master-settings/FeedbackModules.vue'
import RecallReminders from '@intake24-dietician/portal/components/master-settings/RecallReminders.vue'
import Notifications from '@intake24-dietician/portal/components/master-settings/Notifications.vue'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// import { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import { useUpdateSurveyPreferences } from '@intake24-dietician/portal/mutations/useSurvey'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DEFAULT_ERROR_MESSAGE } from '@intake24-dietician/portal/constants'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
import { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'

const $toast = useToast()
const route = useRoute()
const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const updateSurveyPreferencesMutation = useUpdateSurveyPreferences()

const formData = ref<SurveyDto>()

const surveyQueryData = computed(() => {
  return surveyQuery.data.value
})

const recallReminderProps = computed(() => {
  const surveyPreference = surveyQuery.data.value?.surveyPreference

  if (
    surveyPreference?.reminderCondition &&
    surveyPreference?.reminderMessage !== undefined
  ) {
    return {
      reminderCondition: surveyPreference.reminderCondition,
      reminderMessage: surveyPreference.reminderMessage,
    }
  }

  return undefined
})

const notificationsProps = computed(() => {
  const surveyPreference = surveyQuery.data.value?.surveyPreference

  if (
    surveyPreference?.notifyEmail !== undefined &&
    surveyPreference?.notifySMS !== undefined
  ) {
    return {
      notifyEmail: surveyPreference.notifyEmail,
      notifySms: surveyPreference.notifySMS,
    }
  }

  return undefined
})

const handleFeedbackModulesUpdate = (value: SurveyDto) => {
  if (!formData.value) {
    return
  }
  formData.value = { ...formData.value, ...value }
}

const handleRecallRemindersUpdate = (value: {
  reminderCondition: ReminderCondition
  reminderMessage: string
}) => {
  if (!formData.value) {
    return
  }

  formData.value = {
    ...formData.value,
    surveyPreference: {
      ...formData.value.surveyPreference,
      reminderCondition: value.reminderCondition,
      reminderMessage: value.reminderMessage,
    },
  }
}

const handleNotificationsUpdate = (channels: {
  email: boolean
  sms: boolean
}) => {
  if (!formData.value) {
    return
  }

  formData.value = {
    ...formData.value,
    surveyPreference: {
      ...formData.value.surveyPreference,
      notifyEmail: channels.email,
      notifySMS: channels.sms,
    },
  }
}

const handleSubmit = async (): Promise<void> => {
  if (!formData.value) {
    $toast.error('No data to submit')
    return
  }

  const { id, ...survey } = formData.value

  // TODO: Add zod validation
  updateSurveyPreferencesMutation.mutate(
    { id, survey },
    {
      onSuccess: () => {
        $toast.success('Survey preferences updated')
      },
      onError: () => {
        $toast.error(DEFAULT_ERROR_MESSAGE)
      },
    },
  )
}

watch(surveyQueryData, newSurveyQueryData => {
  if (!newSurveyQueryData?.surveyPreference) return
  formData.value = newSurveyQueryData
})
</script>

<style scoped lang="scss">
.wrapper {
  background: rgb(252, 249, 244);
  background: -moz-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: -webkit-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#fcf9f4",endColorstr="#ffffff",GradientType=1);
}
</style>
