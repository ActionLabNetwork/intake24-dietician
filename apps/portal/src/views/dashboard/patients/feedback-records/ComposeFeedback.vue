<template>
  <div class="wrapper">
    <v-container>
      <div>
        <v-btn
          prepend-icon="mdi-chevron-left"
          flat
          class="text-none px-0 mt-10"
          variant="text"
          to="/dashboard/my-patients"
        >
          Back to {{ patientName }} records
        </v-btn>
      </div>
      <div class="mt-4">
        <ProfileAndFeedbackCard
          :id="paddedId"
          :avatar="avatar"
          :fullName="fullName"
          @update:daterange="handleDateRangeUpdate"
        />
      </div>
      <div class="mt-4">
        <v-row>
          <v-col cols="3">
            <ModuleSelectList @update="handleModuleUpdate" />
          </v-col>
          <v-col cols="9">
            <component
              :is="routeToModuleComponentMapping[component]"
            ></component>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'
import { useRoute } from 'vue-router'
import { usePatientById } from '@/queries/usePatients'
import ProfileAndFeedbackCard from '@intake24-dietician/portal/components/feedback/ProfileAndFeedbackCard.vue'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import ModuleSelectList from '@intake24-dietician/portal/components/feedback-modules/ModuleSelectList.vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import type { ModuleRoute } from '@/types/modules.types'
// const { t } = useI18n<i18nOptions>()

interface ComponentMapping {
  '/meal-diary': typeof MealDiaryModule
  '/carbs-exchange': typeof CarbsExchangeModule
  '/energy-intake': typeof EnergyIntakeModule
  '/fibre-intake': typeof FibreIntakeModule
  '/water-intake': typeof WaterIntakeModule
}

const route = useRoute()
const patientQuery = usePatientById(route.params['id']?.toString() ?? '')

const patientQueryData = computed(() => {
  return patientQuery.data.value?.data.data
})

const paddedId = computed(() => {
  return ((route.params['id'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
})

const patientName = computed(() => {
  const firstName = patientQueryData.value?.patientProfile?.firstName

  if (!firstName) {
    return ''
  }
  return firstName.endsWith('s') ? `${firstName}'` : `${firstName}'s`
})

const fullName = computed(() => {
  const firstName = patientQueryData.value?.patientProfile?.firstName ?? ''
  const lastName = patientQueryData.value?.patientProfile?.lastName ?? ''

  return `${firstName} ${lastName}`
})

const avatar = computed(() => {
  return (
    patientQuery.data.value?.data.data.patientProfile?.avatar ??
    getDefaultAvatar('')
  )
})

const component = ref<ModuleRoute>('/meal-diary')
const routeToModuleComponentMapping: ComponentMapping = {
  '/meal-diary': MealDiaryModule,
  '/carbs-exchange': CarbsExchangeModule,
  '/energy-intake': EnergyIntakeModule,
  '/fibre-intake': FibreIntakeModule,
  '/water-intake': WaterIntakeModule,
}
const handleModuleUpdate = (module: ModuleRoute) => {
  component.value = module
}

const handleDateRangeUpdate = (dateRange: [Date, Date]) => {
  console.log(dateRange)
}
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
