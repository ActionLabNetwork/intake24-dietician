<template>
  <BaseDialog v-model="dialog" width="40vw" :on-confirm="props.onConfirm">
    <template #title> Sharing feedback draft </template>
    <template #default>
      Are you sure you want to share the feedback with
      <span class="font-weight-medium"> {{ fullName }} </span>?

      <div class="send-mode text-center">
        <p class="font-weight-medium">
          Select how you want the feedback to be sent
        </p>

        <v-item-group v-model="sendMode" mandatory>
          <v-container>
            <v-row>
              <v-col v-for="mode in modes" :key="mode.value" cols="12" md="6">
                <v-item v-slot="{ isSelected, toggle }" :value="mode.value">
                  <v-card
                    :color="isSelected ? 'secondary' : ''"
                    class="d-flex align-center"
                    dark
                    height="200"
                    @click="toggle"
                  >
                    <v-scroll-y-transition>
                      <div class="text-h6 flex-grow-1 text-center">
                        {{ mode.label }}
                      </div>
                    </v-scroll-y-transition>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-container>
        </v-item-group>

        <div class="text-left">
          <v-alert
            v-if="sendMode === 'automated'"
            icon="mdi-information-variant-circle-outline"
          >
            We will send the email on your behalf to the patient. This selection
            gives you no control over the email sent.
          </v-alert>
          <v-alert v-else icon="mdi-information-variant-circle-outline">
            <p>
              We will prefill most fields for you but leave it to you to attach
              the feedback. This selection gives you full control over the email
              sent.
            </p>
            <br />
            <div class="d-flex align-center">
              <v-icon icon="mdi-numeric-1-circle-outline" />
              <p class="ml-3">
                Access the prefilled email here: <br />
                <a :href="mailtoHref">Email template</a>
              </p>
            </div>
            <br />
            <div class="d-flex align-center">
              <v-icon icon="mdi-numeric-2-circle-outline" />
              <p class="ml-3">
                Visit this page to save the feedback as PDF: <br />
                <a :href="_downloadUrl" target="_blank">Download PDF</a>
              </p>
            </div>
            <br />
            <div class="d-flex align-center">
              <v-icon icon="mdi-numeric-3-circle-outline" />
              <p class="ml-3">
                Once you're done with the email, click the "Confirm" button
                below to save a record of the feedback in the system.
              </p>
            </div>
          </v-alert>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@intake24-dietician/portal/components/common/BaseDialog.vue'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  fullName: string
  downloadUrl: string
  onConfirm: () => Promise<void>
}>()

const patientStore = usePatientStore()
const modes = [
  { label: 'Automated', value: 'automated' },
  { label: 'Manual', value: 'manual' },
] as const

const dialog = defineModel<boolean>()
const sendMode = defineModel<'automated' | 'manual'>('sendMode')

const mailtoHref = computed(() => {
  const patientEmail = patientStore.patientQuery.data?.user.email ?? ''
  const subject = encodeURIComponent('Intake24-Dietician: Your Recall Feedback')
  const body = encodeURIComponent(
    'Your feedback is ready for review. Please find it under attachments to view it.',
  )

  return `mailto:${patientEmail}?subject=${subject}&body=Hi%20${props.fullName},%0D%0A%0D%0A${body}`
})

const _downloadUrl = computed(() => {
  const url = new URL(props.downloadUrl)
  const params = url.searchParams
  params.set('download', 'true')

  return url.toString()
})
</script>

<style scoped lang="scss">
.send-mode {
  border: 1px solid;
  border-radius: 4px;
  margin-top: 1rem;
  padding: 0.75rem;
}
</style>
