<template>
  <v-main>
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center"
      >
        <div>
          <h1 class="text heading">{{ t('profile.title') }}</h1>
          <h3 class="text subheading">
            {{ t('profile.subtitle') }}
          </h3>
        </div>
        <div>
          <v-btn color="primary text-capitalize" class="mt-3 mt-sm-0">
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <PersonalDetails />
      <ContactDetails class="mt-10" />
      <Bio class="mt-16" />
      <div class="mt-16">
        <p class="font-weight-bold">{{ t('profile.form.review.title') }}</p>
        <v-btn color="primary text-capitalize" class="mt-3">
          {{ t('profile.cta') }}
        </v-btn>
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import PersonalDetails from '@/components/profile/PersonalDetails.vue'
import ContactDetails from '@/components/profile/ContactDetails.vue'
import Bio from '@/components/profile/Bio.vue'
import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n<i18nOptions>()
locale.value = 'en'
</script>

<style scoped lang="scss">
v-btn {
  background-color: #1e88e5;
  color: white;
}

.text {
  max-width: 75%;
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
