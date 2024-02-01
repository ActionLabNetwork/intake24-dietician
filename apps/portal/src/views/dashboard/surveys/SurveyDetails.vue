<template>
  <v-main class="wrapper">
    <v-row class="ml-1">
      <SurveyClinicDetails v-if="!hideSurveyDetails" />
    </v-row>
    <v-row>
      <v-col cols="12" md="12" class="pa-0 ma-0">
        <router-view />
      </v-col>
    </v-row>
  </v-main>
</template>

<script lang="ts" setup>
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
// import NavCard from '@/components/surveys/NavCard.vue'
import SurveyClinicDetails from '@/components/surveys/SurveyClinicDetails.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

// const { t } = useI18n<i18nOptions>()

const route = useRoute()

const hideSurveyDetails = computed(() => {
  const routeNames = [
    'Survey Master Settings',
    'Survey Patient Compose New Feedback',
  ]
  return routeNames.includes(route.name as string)
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

@media print {
  .wrapper {
    background: white;
  }
}
</style>
