<template>
  <v-main v-if="isProfileLoading" align="center">
    <v-container>
      <v-progress-circular indeterminate></v-progress-circular>
    </v-container>
  </v-main>
  <v-main v-else class="wrapper">
    <v-container>
      <Transition>
        <v-alert v-model:model-value="welcomeAlert">
          <div
            class="d-flex flex-column flex-sm-row justify-space-between align-center"
          >
            <div>
              <h1 class="text heading">
                {{ t('surveys.disclaimerNotrifications.title', { username: user?.dieticianProfile.firstName}) }}
              </h1>
              <h3 class="text subheading">
                {{ t('surveys.disclaimerNotrifications.subtitle', {newSurveysNumber: 3, templatesNumber: 1}) }}
              </h3>
            </div>
            <div>
              <v-btn
                type="submit"
                variant="outlined"
                class="mt-3 mt-sm-0 text-capitalize"
                density="comfortable"
                @click="welcomeAlert = false"
              >
                {{t('surveys.disclaimerNotrifications.dismiss')}}
              </v-btn>
            </div>
          </div>
        </v-alert>
      </Transition>

      <div class="my-10"></div>
      <div>
        <HomeSummary :summary="summary" :summaryKeys="summaryKeys" />
        <SurveysList
          :data="dataQuery.data.value?.data.ok === true ? dataQuery.data.value?.data.value : []"
        />
      </div>
    </v-container>
  </v-main>
  <router-view />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import 'vue-toast-notification/dist/theme-sugar.css'
import HomeSummary from '@/components/common/HomeSummary.vue'
import type { Summary, SummaryKeys } from '@/components/common/HomeSummary.vue'
import SurveysList from '@/components/surveys/SurveysList.vue'
import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'
import { useSurveys } from '@intake24-dietician/portal/queries/useSurveys'

const { t } = useI18n<i18nOptions>()
const authStore = useAuthStore()
const { user, isProfileLoading } = storeToRefs(authStore)

const welcomeAlert = ref(true)

const dataQuery = useSurveys()

const summary = computed((): Summary => {
  const data = dataQuery.data.value?.data
  if (data === undefined || !data.ok) return { total: 0, active: 0, archived: 0 }
  console.log(data)

  return data.value.reduce(
    (counts, survey) => {
      counts.total++
      counts.active++
      console.log(survey)
      return counts
    },
    { total: 0, active: 0, archived: 0 },
  )
})

const summaryKeys = computed((): SummaryKeys => {
  return {
    entry: t('surveys.entry'),
    entrySingular: t('surveys.entrySingular'),
  }
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
.text {
  max-width: 100%;
  padding-bottom: 0.5rem;

  &.heading {
    color: #000;
    font-family: Roboto;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  &.subheading {
    color: #555;
    font-family: Roboto;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
  }
}
</style>
