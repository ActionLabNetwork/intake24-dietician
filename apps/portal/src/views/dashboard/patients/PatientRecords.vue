<template>
  <v-main>
    <v-container fluid class="container-padding">
      <BackButton :to="backButtonDestination">
        Back to patient list
      </BackButton>
      <v-row class="mt-6">
        <v-col cols="12" md="3">
          <DetailsAndNavCard class="mx-sm-0 mx-auto mb-10" />
        </v-col>
        <v-col cols="12" md="9">
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import DetailsAndNavCard from '@/components/patients/DetailsAndNavCard.vue'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import { useRoute } from 'vue-router'
import 'vue-toast-notification/dist/theme-sugar.css'

// const { t } = useI18n<i18nOptions>()

const route = useRoute()

const surveyId = computed(() => route.params['surveyId'])
const backButtonDestination = computed(() =>
  surveyId.value
    ? {
        name: 'Survey Patient List',
        params: { surveyId: surveyId.value },
      }
    : undefined,
)
</script>

<style scoped lang="scss">
.container-padding {
  padding: 2rem 5rem;
  height: 100%;
}
</style>
