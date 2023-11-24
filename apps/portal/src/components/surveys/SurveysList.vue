<template>
  <v-row class="mt-10 align-center">
    <v-col>
      <p class="font-weight-medium">Surveys list</p>
    </v-col>
    <v-col class="d-flex">
      <v-spacer />
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search surveys..."
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
    </v-col>
  </v-row>

  <div class="mt-4">
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers as unknown as ReadonlyDataTableHeader[]"
      :search="search"
      :items="surveys"
      item-value="name"
      class="elevation-1"
    >
      <template v-slot:headers="{ columns, isSorted, toggleSort, sortBy }">
        <tr class="table-header">
          <template v-for="column in columns" :key="column.key">
            <td>
              <div
                class="pa-4 table-header d-flex align-center justify-center"
                @click="() => toggleSort(column)"
              >
                <span class="mr-2 cursor-pointer">
                  {{ column.title }}
                </span>
                <div v-if="column.sortable">
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
              </div>
            </td>
          </template>
        </tr>
      </template>
      <template v-slot:item="{ item }">
        <tr class="text-center">
          <td class="text-left">
            <div class="d-flex align-center">
              <!-- <v-avatar :image="getDefaultAvatar(item.raw.name)" /> -->
              <span class="ml-5 text-left">{{ item.raw.name }}</span>
            </div>
          </td>
          <!-- <td>
            <v-btn
              color="primary"
              class="text-capitalize"
              min-width="50%"
              :to="`/dashboard/my-patients/patient-records/${item.raw.id}/feedback-records`"
            >
              View
            </v-btn>
          </td> -->
          <td>{{ item.raw.alias }}</td>
          <td>
            <div class="d-flex flex-column align-center">
              {{ item.raw.recallSubmissionUrl }}
              <!-- <v-chip
                variant="outlined"
                :color="
                  item.raw.lastFeedbackSent.type === 'Tailored'
                    ? 'success'
                    : 'warning'
                "
                class="mt-2"
                :text="item.raw.lastFeedbackSent.type"
              >
              </v-chip> -->
            </div>
          </td>
          <!-- <td>
            <v-chip
              variant="flat"
              :color="
                item.raw.patientStatus === 'Active' ? 'success' : 'neutral'
              "
              :text="item.raw.patientStatus"
            >
            </v-chip>
            <span v-show="false">{{ item.raw.patientStatus }}</span>
          </td> -->
          <!-- <td>
            <div
              class="d-flex flex-column flex-xl-row align-baseline justify-center"
            >
              {{ item.raw.lastReminderSent }}
              <span class="mt-2 ml-0 ml-xl-4">
                <v-btn class="text-capitalize" color="accent"> Remind </v-btn>
              </span>
            </div>
          </td> -->
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VDataTable } from 'vuetify/lib/labs/components.mjs'
import type { CamelCase } from 'type-fest'
// import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
// import { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import { SurveyDTO } from '@intake24-dietician/common/entities/survey.dto.ts'
// import { useSurveys } from '@intake24-dietician/portal/queries/useSurveys'

// Manual type unwrapping as vuetify doesn't expose headers type
type UnwrapReadonlyArrayType<A> = A extends Readonly<Array<infer I>>
  ? UnwrapReadonlyArrayType<I>
  : A
type DT = InstanceType<typeof VDataTable>
type ReadonlyDataTableHeader = UnwrapReadonlyArrayType<DT['headers']>

const props = defineProps<{
  data: (SurveyDTO)[]
}>()
const headerTitles = ['Name', 'Alias', 'Recall Submission Url'] as const

interface SurveyTableHeaders {
  title: (typeof headerTitles)[number]
  align: string
  key: string
  sortable: boolean
}

type SurveyTableColumns = {
  [K in CamelCase<(typeof headerTitles)[number]>]: unknown
}

interface KeyValueTypes {
  id: number
  name: string
  alias: string
  recallSubmissionUrl: string
}

type SpecificSurveyTableColumns = {
  [K in keyof SurveyTableColumns]: K extends keyof KeyValueTypes
    ? KeyValueTypes[K]
    : unknown
}

const itemsPerPage = ref(5)
const headers = ref<SurveyTableHeaders[]>([
  {
    title: 'Name',
    align: 'start',
    key: 'name',
    sortable: false,
  },
  {
    title: 'Alias',
    align: 'start',
    key: 'alias',
    sortable: true,
  },
  {
    title: 'Recall Submission Url',
    align: 'center',
    key: 'recallSubmissionUrl',
    sortable: false,
  },
])

const search = ref('')

// function randomDate(start: Date, end: Date) {
//   return new Date(
//     start.getTime() + Math.random() * (end.getTime() - start.getTime()),
//   )
// }

// const getRandomDate = () =>
//   randomDate(new Date(2012, 0, 1), new Date()).toLocaleString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   })

const surveys = ref<SpecificSurveyTableColumns[]>([])

watch(
  () => props.data,
  newSurvey => {
    // TODO: Update reminder related fields once implemented
    surveys.value =
    newSurvey.map(survey => {
        return {
          id: survey.id,
          name: survey.name,
          alias: survey.alias,
          recallSubmissionUrl: survey.recallSubmissionUrl ?? '',
        }
      }) ?? []
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.v-data-table thead tr {
  background-color: #fcfaf7;
  padding: 0.5rem 0; // Adjust the padding as desired
}
.table-header {
  cursor: pointer;
  color: #555555;
  background-color: #FCFAF7;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.v-data-table td {
  padding: 1rem 0.3rem !important;
}
</style>
