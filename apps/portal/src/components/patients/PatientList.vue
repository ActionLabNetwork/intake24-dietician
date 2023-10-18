<template>
  <p class="font-weight-medium mt-16">Patient list</p>
  <div class="mt-4">
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers as unknown as ReadonlyDataTableHeader[]"
      :items="patients"
      item-value="name"
      class="elevation-1"
    >
      <template v-slot:headers="{ columns, isSorted, toggleSort, sortBy }">
        <tr>
          <template v-for="column in columns" :key="column.key">
            <td class="text-center">
              <div
                class="pa-4 table-header"
                @click.stop="() => toggleSort(column)"
              >
                <span class="mr-2 cursor-pointer">
                  {{ column.title }}
                </span>

                <v-icon
                  v-if="!isSorted(column)"
                  icon="mdi-unfold-more-horizontal"
                />
                <v-icon
                  v-else
                  :icon="
                    sortBy[0]?.order === 'asc'
                      ? 'mdi-chevron-up'
                      : 'mdi-chevron-down'
                  "
                />
              </div>
            </td>
          </template>
        </tr>
      </template>
      <template v-slot:item="{ item }">
        <tr class="text-center">
          <td class="text-left">
            <div class="d-flex align-center">
              <v-avatar :image="getDefaultAvatar(item.raw.name)" />
              <span class="ml-5">{{ item.raw.name }}</span>
            </div>
          </td>
          <td>
            <v-btn color="primary" class="text-capitalize" min-width="50%">
              View
            </v-btn>
          </td>
          <td>{{ item.raw.lastRecall }}</td>
          <td>
            <div class="d-flex flex-column align-center">
              {{ item.raw.lastFeedbackSent.date }}
              <v-chip
                variant="outlined"
                :color="
                  item.raw.lastFeedbackSent.type === 'Tailored'
                    ? 'success'
                    : 'warning'
                "
                class="mt-2"
                :text="item.raw.lastFeedbackSent.type"
              >
              </v-chip>
            </div>
          </td>
          <td>
            <v-chip
              variant="flat"
              :color="
                item.raw.patientStatus === 'Active' ? 'success' : 'neutral'
              "
              class="ml-4"
              :text="item.raw.patientStatus"
            >
            </v-chip>
          </td>
          <td>
            <div class="d-flex flex-column">
              {{ item.raw.lastReminderSent }}
              <span class="mt-2">
                <v-btn class="text-capitalize" color="accent"> Remind </v-btn>
              </span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VDataTable } from 'vuetify/lib/labs/components.mjs'
import type { CamelCase } from 'type-fest'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'

// Manual type unwrapping as vuetify doesn't expose headers type
type UnwrapReadonlyArrayType<A> = A extends Readonly<Array<infer I>>
  ? UnwrapReadonlyArrayType<I>
  : A
type DT = InstanceType<typeof VDataTable>
type ReadonlyDataTableHeader = UnwrapReadonlyArrayType<DT['headers']>

const headerTitles = [
  'Name',
  'Patient records',
  'Last recall',
  'Last feedback sent',
  'Patient status',
  'Last reminder sent',
] as const

interface PatientTableHeaders {
  title: (typeof headerTitles)[number]
  align: string
  key: string
}

type PatientTableColumns = {
  [K in CamelCase<(typeof headerTitles)[number]>]: unknown
}

interface KeyValueTypes {
  name: string
  patientRecords: undefined
  lastRecall: string
  lastFeedbackSent: {
    date: string
    type: 'Tailored' | 'Auto'
  }
  patientStatus: 'Active' | 'Archived'
  lastReminderSent: string
}

type SpecificPatientTableColumns = {
  [K in keyof PatientTableColumns]: K extends keyof KeyValueTypes
    ? KeyValueTypes[K]
    : unknown
}

const itemsPerPage = ref(5)
const headers = ref<PatientTableHeaders[]>([
  {
    title: 'Name',
    align: 'start',
    key: 'name',
  },
  { title: 'Patient records', align: 'center', key: 'calories' },
  { title: 'Last recall', align: 'center', key: 'fat' },
  { title: 'Last feedback sent', align: 'center', key: 'carbs' },
  { title: 'Patient status', align: 'center', key: 'protein' },
  { title: 'Last reminder sent', align: 'center', key: 'iron' },
])

const dateToday = new Date().toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const patients = ref<SpecificPatientTableColumns[]>([
  {
    name: 'Giana Levin',
    patientRecords: undefined,
    lastRecall: dateToday,
    lastFeedbackSent: { date: dateToday, type: 'Tailored' },
    patientStatus: 'Active',
    lastReminderSent: dateToday,
  },
  {
    name: 'Marley George',
    patientRecords: undefined,
    lastRecall: dateToday,
    lastFeedbackSent: { date: dateToday, type: 'Auto' },
    patientStatus: 'Active',
    lastReminderSent: dateToday,
  },
  {
    name: 'Mira Workman',
    patientRecords: undefined,
    lastRecall: dateToday,
    lastFeedbackSent: { date: dateToday, type: 'Auto' },
    patientStatus: 'Active',
    lastReminderSent: dateToday,
  },
  {
    name: 'Cheyenne Stanton',
    patientRecords: undefined,
    lastRecall: dateToday,
    lastFeedbackSent: { date: dateToday, type: 'Tailored' },
    patientStatus: 'Active',
    lastReminderSent: dateToday,
  },
  {
    name: 'Terry Franci',
    patientRecords: undefined,
    lastRecall: dateToday,
    lastFeedbackSent: { date: dateToday, type: 'Tailored' },
    patientStatus: 'Archived',
    lastReminderSent: dateToday,
  },
])
</script>
<style scoped lang="scss">
.v-data-table thead tr {
  background-color: #fcfaf7;
  padding: 0.5rem 0; // Adjust the padding as desired
}
.table-header {
  cursor: pointer;
  color: #555555;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.v-data-table td {
  padding: 1rem 2rem !important;
}
</style>
