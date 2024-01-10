<template>
  <v-card :loading="patientQuery.isPending.value">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="orange"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>
    <v-card-item>
      <div class="text-center font-weight-medium">
        <v-avatar size="x-large" :image="avatar ?? ''" />
        <p class="title text-md mt-4">{{ fullName }}</p>
      </div>
      <v-card-subtitle class="text-center">
        ID: {{ paddedId }}
      </v-card-subtitle>
      <v-divider class="border-opacity-100 my-2"></v-divider>
      <v-card-actions class="d-flex flex-column">
        <v-list nav>
          <v-list-item
            v-for="item in navItems"
            v-show="item.show"
            :key="item.value"
            :title="item.title"
            :to="item.to"
            :active="item.selected"
            align="center"
          />
        </v-list>
      </v-card-actions>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'
import { usePatientById } from '@/queries/usePatients'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'

const props = defineProps<{ hasRecalls: boolean }>()

const route = useRoute()
const patientQuery = usePatientById(route.params['patientId'] as string)

const paddedId = computed(() => {
  return ((route.params['patientId'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
})

const fullName = computed(() => {
  const firstName = patientQuery.data.value?.firstName ?? ''
  const lastName = patientQuery.data.value?.lastName ?? ''

  return `${firstName} ${lastName}`
})

const avatar = computed(() => {
  return patientQuery.data.value?.avatar ?? getDefaultAvatar()
})

const navItems = ref([
  {
    title: 'Feedback records',
    value: 'feedbackRecords',
    to: {
      name: 'Survey Patient Feedback Records',
      params: {
        surveyId: route.params['surveyId'],
        patientId: route.params['patientId'],
      },
    },
    selected: computed(() => route.path.includes('feedback-records')),
    show: true,
  },
  {
    title: 'Patient details',
    value: 'patientDetails',
    to: {
      name: 'Survey Patient Details',
      params: {
        surveyId: route.params['surveyId'],
        patientId: route.params['patientId'],
      },
    },
    selected: computed(() => route.path.includes('patient-details')),
    show: true,
  },
  {
    title: 'Patient recalls',
    value: 'patientRecalls',
    to: {
      name: 'Survey Patient Meal Diary',
      params: {
        surveyId: route.params['surveyId'],
        patientId: route.params['patientId'],
      },
    },
    selected: computed(() => route.path.includes('patient-recalls')),
    show: toRefs(props).hasRecalls.value,
  },
])
</script>

<style scoped lang="scss">
$gray: #d9d9d9;

.title {
  font-size: 1.125rem;
}
</style>
