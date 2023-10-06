<template>
  <v-main class="wrapper">
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
      <ContactDetails v-if="user" :email="user.email" class="mt-10" />
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
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const { t } = useI18n<i18nOptions>()

const authStore = useAuthStore()
authStore.getSession()
const { user } = storeToRefs(authStore)
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
