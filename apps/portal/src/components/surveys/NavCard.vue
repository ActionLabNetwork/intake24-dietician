<template>
  <v-card>
    <template #loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="orange"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>
    <v-card-item>
      <v-card-subtitle class="text-center py-4">
        ID: {{ paddedId }}
      </v-card-subtitle>
      <v-divider class="border-opacity-100 my-2"></v-divider>
      <v-card-actions class="d-flex flex-column">
        <v-list nav>
          <v-list-item
            v-for="item in navItems"
            :key="item.value"
            :title="item.title"
            :to="item.to"
            :active="item.selected.value"
            align="center"
          />
        </v-list>
      </v-card-actions>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'

const route = useRoute()

const paddedId = computed(() => {
  return ((route.params['surveyId'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
})

const navItems = [
  {
    title: 'Master Settings',
    value: 'masterSettings',
    to: `/dashboard/my-surveys/survey-details/${route.params['surveyId']}/master-settings`,
    selected: computed(() => route.path.includes('master-settings')),
  },
  {
    title: 'Patient List',
    value: 'patientList',
    to: `/dashboard/my-patients/patient-records/${route.params['patientId']}/patient-list`,
    selected: computed(() => route.path.includes('patient-list')),
  },
]
</script>

<style scoped lang="scss">
$gray: #d9d9d9;

.title {
  font-size: 1.125rem;
}
</style>
