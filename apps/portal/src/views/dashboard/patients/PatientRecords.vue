<template>
  <v-main class="wrapper">
    <v-container>
      <!-- <v-row>
        <v-breadcrumbs :items="breadcrumbItems">
          <template v-slot:divider>
            <v-icon icon="mdi-chevron-right"></v-icon>
          </template>
        </v-breadcrumbs>
      </v-row> -->
      <v-row>
        <v-btn
          prepend-icon="mdi-chevron-left"
          flat
          class="text-none"
          variant="text"
          :to="{
            name: 'Survey Patient List',
            params: { surveyId: route.params['surveyId'] },
          }"
        >
          Back to patient list
        </v-btn>
      </v-row>
      <v-row class="mt-6">
        <v-col cols="12" md="3">
          <DetailsAndNavCard
            v-if="!recallsQuery.isPending.value"
            :has-recalls="hasRecalls"
            class="mx-sm-0 mx-auto mb-10"
          />
          <ModuleSelectList
            v-if="route.path.includes('patient-recalls')"
            @update="handleModuleUpdate"
          />
        </v-col>
        <v-col cols="12" md="9">
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { computed, defineComponent, ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import DetailsAndNavCard from '@/components/patients/DetailsAndNavCard.vue'
import ModuleSelectList from '@intake24-dietician/portal/components/feedback-modules/ModuleSelectList.vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecallsByUserId } from '@intake24-dietician/portal/queries/useRecall'

// const { t } = useI18n<i18nOptions>()

const router = useRouter()
const route = useRoute()

// const breadcrumbItems = ref([
//   {
//     title: 'My Patients',
//     disabled: false,
//     href: '/dashboard/my-patients',
//   },
//   {
//     title: 'Patient records',
//     disabled: true,
//     href: '/dashboard/patient-records',
//   },
// ])

const component = ref()

const recallsQuery = useRecallsByUserId(
  ref(route.params['patientId'] as string),
)

const hasRecalls = computed(() => (recallsQuery.data.value?.length ?? 0) > 0)

const handleModuleUpdate = (module: ReturnType<typeof defineComponent>) => {
  const segments = route.path.split('/')
  segments.pop()
  const path = segments.join('/')

  component.value = module
  router.push(`${path}${module}`)
}

// watch(
//   () => recallsQuery.data,
//   recalls => {
//     // Update Pinia store with new recalls
//     recallsStore.recalls =
//       recalls.value?.map(recall => ({
//         ...recall,
//         recall: {
//           ...recall.recall,
//           startTime: recall.recall.startTime,
//           endTime: recall.recall.endTime,
//         },
//       })) ?? []
//   },
//   { immediate: true },
// )
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
