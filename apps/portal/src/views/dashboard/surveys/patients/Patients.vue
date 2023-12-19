<template>
  <v-main v-if="isProfileLoading" align="center">
    <v-container>
      <v-progress-circular indeterminate></v-progress-circular>
    </v-container>
  </v-main>
  <v-main v-else class="wrapper">
    <v-container>
      <div></div>
      <div>
        <HomeSummary
          :summary="summary"
          :summaryKeys="summaryKeys"
          :addButtonLink="addButtonLink"
        />
        <PatientList
          :patients-data="patientsQuery.data.value?.data.data ?? []"
        />
      </div>
    </v-container>
  </v-main>
  <router-view />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import 'vue-toast-notification/dist/theme-sugar.css'
import HomeSummary from '@/components/common/HomeSummary.vue'
import type { Summary, SummaryKeys } from '@/components/common/HomeSummary.vue'
import PatientList from '@/components/patients/PatientList.vue'
import { usePatients } from '@intake24-dietician/portal/queries/usePatients'
import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n<i18nOptions>()

const authStore = useAuthStore()
const { isProfileLoading } = storeToRefs(authStore)

const route = useRoute()

const patientsQuery = usePatients()

const addButtonLink = `/dashboard/my-surveys/survey-details/${route.params['id']}/add-patient`

const summary = computed((): Summary => {
  const patients = patientsQuery.data.value?.data.data ?? []

  return patients.reduce(
    (counts, patient) => {
      counts.total++
      if (patient.isArchived) {
        counts.archived++
      } else {
        counts.active++
      }
      return counts
    },
    { total: 0, active: 0, archived: 0 },
  )
})

const summaryKeys = computed((): SummaryKeys => {
  return {
    entry: t('patients.entry'),
    entrySingular: t('patients.entrySingular'),
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
