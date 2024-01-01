<template>
  <v-main class="wrapper">
    <v-container>
      <v-row class="ml-4">
        <SurveyWorkplaceDetails />
      </v-row>
      <v-row>
        <!-- <v-col cols="12" md="3"> -->
        <!-- <NavCard class="mx-sm-0 mx-auto mb-10" /> -->
        <!-- </v-col> -->
        <v-col cols="12" md="12">
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
// import NavCard from '@/components/surveys/NavCard.vue'
import SurveyWorkplaceDetails from '@/components/surveys/SurveyWorkspaceDetails.vue'

// const { t } = useI18n<i18nOptions>()
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
