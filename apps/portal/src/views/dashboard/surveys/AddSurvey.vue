<template>
    <v-main class="wrapper">
        <v-container>
            <v-breadcrumbs :items="breadcrumbItems" class="pa-0">
                <template v-slot:divider>
                    <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
            </v-breadcrumbs>
            <v-btn
                prepend-icon="mdi-chevron-left"
                flat
                class="text-none px-0 mt-10"
                variant="text"
                to="/dashboard/my-surveys"
            >
                {{ t('surveys.backToSurveyList') }}
            </v-btn>
            <SurveyConfiguration 
            :default-state="surveyConfigFormValues"
            mode="Add"
            @update="handleSurveyConfigUpdate"
            />
        </v-container>
    </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SurveyConfiguration, { SurveyConfigursationFormValues } from '@intake24-dietician/portal/components/surveys/SurveyConfiguration.vue';
import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'


const { t } = useI18n<i18nOptions>()

const breadcrumbItems = ref([
  {
    title: 'My Surveys',
    disabled: false,
    href: '/dashboard/my-surveys',
  },
  {
    title: 'Add new Survey',
    disabled: true,
    href: '/dashboard/my-patients/add-survey',
  },
])

const surveyConfigFormValues = ref({
    name: '',
    alias: '',
    status:'inactive',
})

const handleSurveyConfigUpdate = (values: SurveyConfigursationFormValues) => {
    surveyConfigFormValues.value = values
}

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
.text {
  max-width: 100%;
  padding-bottom: 0.5rem;

  &.heading {
    color: #000;
    font-family: Roboto;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  &.subheading {
    color: #555;
    font-family: Roboto;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
  }
}
</style>