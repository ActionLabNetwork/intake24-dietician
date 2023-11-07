<template>
  <div class="wrapper">
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center mt-12"
      >
        <div>
          <h1 class="text heading">Notification setup</h1>
          <h3 class="text subheading">
            Choose how you would like to receive notification when a patient
            completes a recall, or when you share feedback with them
          </h3>
        </div>
        <div class="alert-text">
          <div>
            <div class="d-flex align-center">
              <div>
                <v-icon icon="mdi-alert-outline" size="large" start />
              </div>
              <div class="font-weight-medium">
                There are changes made in master module setup, review and
                confirm changes before proceeding!
              </div>
            </div>
          </div>
          <div class="align-self-center">
            <v-btn color="primary text-none" class="mt-3 mt-sm-0" type="submit">
              Review and confirm changes
            </v-btn>
          </div>
        </div>
      </div>

      <v-divider class="my-10" />
      <div>
        <v-form ref="form">
          <div class="font-weight-medium">I would like to be notified via:</div>
          <div
            v-for="channel in notificationChannels"
            :key="channel"
            class="switch-flex-container"
          >
            <div
              class="d-flex flex justify-space-around align-center switch-container"
            >
              <div>{{ channel }}</div>
              <div>
                <v-switch color="success" inset class="switch" />
              </div>
            </div>
          </div>

          <div class="mt-10">
            <p class="font-weight-medium">Review and save changes</p>
            <div class="text subheading">
              You have made changes to the master module setup. Review and
              confirm the changes before you proceed with adding patients or
              reviewing recall feedback
            </div>
            <v-btn color="primary" class="text-none mt-4" type="submit">
              Review and confirm changes
            </v-btn>
          </div>
        </v-form>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
// const { t } = useI18n<i18nOptions>()

// const $toast = useToast()

const form = ref()
const notificationChannels = ref(['SMS', 'Email'])
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
