<template>
  <v-row class="mt-10 align-center">
    <v-col>
      <p class="font-weight-medium">Patient list</p>
    </v-col>
    <v-col class="d-flex">
      <v-spacer />
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search patient..."
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
      :items="patients"
      item-value="name"
      class="elevation-1"
    >
      <template v-slot:headers="{ columns, isSorted, toggleSort, sortBy }">
        <tr>
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
              <v-avatar
                :image="item.raw.avatar || getDefaultAvatar(item.raw.email)"
              />
              <span class="ml-5 text-left">{{ item.raw.name }}</span>
            </div>
          </td>
          <td>
            <v-btn
              color="primary"
              class="text-capitalize"
              min-width="50%"
              :to="{
                name: 'Survey Patient Feedback Records',
                params: { patientId: item.raw.id },
              }"
            >
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
              :text="item.raw.patientStatus"
            >
            </v-chip>
            <span v-show="false">{{ item.raw.patientStatus }}</span>
          </td>
          <td>
            <div
              class="d-flex flex-column flex-xl-row align-baseline justify-center"
            >
              {{ item.raw.lastReminderSent }}
              <span class="mt-2 ml-0 ml-xl-4">
                <v-btn class="text-capitalize" color="accent"> Remind </v-btn>
              </span>
            </div>
          </td>
          <td class="align-center">
            <v-btn
              icon="mdi-content-copy"
              size="medium"
              variant="plain"
              @click="generateSurveyLink(item.raw.surveyURL)"
            />
            <!-- {{ item.raw.surveyURL }} -->
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>

  <v-snackbar v-model="snackbar" color="success">
    URL is copied to clipboard
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VDataTable } from 'vuetify/lib/labs/components.mjs'
import type { CamelCase } from 'type-fest'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import { PatientWithUserDto } from '@intake24-dietician/common/entities-new/user.dto'
// import { useRecallsByUserId } from '@intake24-dietician/portal/queries/useRecall'
// import { computed } from 'vue'
// import { usePatients } from '@intake24-dietician/portal/queries/usePatients'

// Manual type unwrapping as vuetify doesn't expose headers type
type UnwrapReadonlyArrayType<A> = A extends Readonly<Array<infer I>>
  ? UnwrapReadonlyArrayType<I>
  : A
type DT = InstanceType<typeof VDataTable>
type ReadonlyDataTableHeader = UnwrapReadonlyArrayType<DT['headers']>

const props = defineProps<{
  patientsData: PatientWithUserDto[]
}>()
const headerTitles = [
  'Id',
  'Name',
  'Patient records',
  'Last recall',
  'Last feedback sent',
  'Patient status',
  'Last reminder sent',
  'Survey URL',
] as const

interface PatientTableHeaders {
  title: (typeof headerTitles)[number]
  align: string
  key: string
  sortable: boolean
}

type PatientTableColumns = {
  [K in CamelCase<(typeof headerTitles)[number]>]: unknown
}

interface KeyValueTypes {
  id: number
  name: string
  patientRecords: undefined
  lastRecall: string
  lastFeedbackSent: {
    date: string
    type: 'Tailored' | 'Auto'
  }
  patientStatus: 'Active' | 'Archived'
  lastReminderSent: string
  surveyURL: string
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
    sortable: true,
  },
  {
    title: 'Patient records',
    align: 'start',
    key: 'patientRecords',
    sortable: false,
  },
  { title: 'Last recall', align: 'center', key: 'lastRecall', sortable: true },
  {
    title: 'Last feedback sent',
    align: 'center',
    key: 'lastFeedbackSent',
    sortable: true,
  },
  {
    title: 'Patient status',
    align: 'center',
    key: 'patientStatus',
    sortable: true,
  },
  {
    title: 'Last reminder sent',
    align: 'center',
    key: 'lastReminderSent',
    sortable: true,
  },
  {
    title: 'Survey URL',
    align: 'center',
    key: 'surveyLink',
    sortable: false,
  },
])

const search = ref('')

const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
}

const getRandomDate = () =>
  randomDate(new Date(2012, 0, 1), new Date()).toLocaleString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const patients = ref<SpecificPatientTableColumns[]>([])

const snackbar = ref(false)

const generateSurveyLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link)
    snackbar.value = true
  } catch (err) {
    console.error('Failed to copy URL: ', err)
  }
}

watch(
  () => props.patientsData,
  newPatients => {
    // TODO: Update reminder related fields once implemented
    patients.value =
      newPatients.map(patient => {
        return {
          id: patient.id,
          email: patient.user.email,
          avatar: patient.avatar,
          name: `${patient.firstName} ${patient.lastName}`,
          patientRecords: undefined,
          lastRecall: getRandomDate(),
          lastFeedbackSent: {
            date: getRandomDate(),
            type: patient.patientPreference.sendAutomatedFeedback
              ? 'Auto'
              : 'Tailored',
          },
          patientStatus: patient.isArchived ? 'Archived' : 'Active',
          lastReminderSent: getRandomDate(),
          surveyURL: patient.startSurveyUrl,
        }
      }) ?? []
  },
  { immediate: true },
)

// watch(
//   () => recallsQuery.data.value?.data,
//   () => {
//     patients.value = patients.value.map(patient => ({
//       ...patient,
//       lastRecall: latestRecallsByPatient.value ?? 'N/A',
//     }))
//   },
// )
</script>
<style scoped lang="scss">
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
