<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div>
      <p class="font-weight-medium">{{ t('surveys.summary.title') }}</p>
      <v-card class="d-flex flex-wrap mt-2 py-2 px-4 elevation-1">
        <div>
          {{ t('surveys.summary.number') }} {{ summaryKeys.entry }}:
          <span class="font-weight-bold">{{ summary.total }}</span>
        </div>
        <div>
          {{ t('surveys.summary.active') }}
          <span class="font-weight-bold">{{ summary.active }}</span>
        </div>
        <div>
          {{ t('surveys.summary.archived') }}
          <span class="font-weight-bold">{{ summary.archived }}</span>
        </div>
      </v-card>
    </div>
    <div>
      <v-btn
        color="primary"
        class="text-capitalize"
        append-icon="mdi-plus"
        :to="addButtonLink"
      >
        {{ t('surveys.summary.addNew') }} {{ summaryKeys.entrySingular }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'

export interface Summary {
  total: number
  active: number
  archived: number
}

export interface SummaryKeys {
  entry: string
  entrySingular: string
}

defineProps<{
  summary: Summary
  summaryKeys: SummaryKeys
  addButtonLink: string
}>()
const { t } = useI18n<i18nOptions>()
</script>

<style scoped lang="scss">
.d-flex {
  gap: 3rem;

  v-card {
    background: white;
    width: fit-content;
  }
}
</style>
