<template>
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
])
</script>
