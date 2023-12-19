<template>
  <div>
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center"
      >
        <div>
          <h1 class="text heading">Notification setup</h1>
          <h3 class="text subheading">
            Choose how you would like to receive notification when a patient
            completes a recall, or when you share feedback with them
          </h3>
        </div>
      </div>

      <v-divider class="my-10" />
      <div>
        <v-form ref="form">
          <div class="font-weight-medium">I would like to be notified via:</div>
          <div
            v-for="(channel, key) in notificationChannels"
            :key="channel.label"
            class="switch-flex-container"
          >
            <div
              class="d-flex flex justify-space-around align-center switch-container"
            >
              <div>{{ channel.label }}</div>
              <div>
                <v-switch
                  v-model="channel.selected"
                  color="success"
                  inset
                  class="switch"
                  @update:model-value="
                    (switchStatus: undefined) =>
                      handleSwitchUpdate(switchStatus, key)
                  "
                />
              </div>
            </div>
          </div>
        </v-form>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
// const { t } = useI18n<i18nOptions>()

// const $toast = useToast()

type NotificationChannel = 'sms' | 'email'

const props = defineProps<{
  defaultState: { notifyEmail: boolean; notifySms: boolean }
}>()
const emit = defineEmits<{
  update: [channels: { email: boolean; sms: boolean }]
}>()

const form = ref()
const notificationChannels = ref({
  email: {
    label: 'Email',
    selected: toRefs(props).defaultState.value.notifyEmail,
  },
  sms: { label: 'SMS', selected: toRefs(props).defaultState.value.notifySms },
})

function handleSwitchUpdate(
  switchStatus: undefined,
  channel: NotificationChannel,
) {
  // Note: Vuetify's update signature is undefined, even though it returns boolean, so we're asserting undefined as boolean.
  notificationChannels.value[channel].selected =
    switchStatus as unknown as boolean

  emit('update', {
    email: notificationChannels.value.email.selected,
    sms: notificationChannels.value.sms.selected,
  })

  console.log({ NEW: notificationChannels.value })
}
</script>

<style scoped lang="scss">
.text {
  max-width: 100%;
  padding-bottom: 0.5rem;
  font-family: Roboto;
  font-style: normal;
  line-height: normal;

  &.heading {
    color: #000;
    font-size: 24px;
    font-weight: 600;
  }

  &.subheading {
    color: #555;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
    max-width: 40vw;
  }

  &.section-heading {
    color: #000;
    font-size: 18px;
    font-weight: 600;
  }

  &.section-heading-2 {
    color: #000;
    font-size: 16px;
    font-weight: 500;
  }

  &.section-subheading {
    color: #555;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
  }
}

.alert-text {
  display: flex;
  flex-direction: column;
  max-width: 30vw;
  gap: 0.5rem;
}

.switch-flex-container {
  display: inline-flex;
  flex-direction: row;
  margin-top: 1rem;
  margin-right: 1rem;
}
.switch-container {
  min-width: 15rem;
  border: 1px black solid;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
}

.switch {
  transform: translateY(0.5rem);
}
</style>
