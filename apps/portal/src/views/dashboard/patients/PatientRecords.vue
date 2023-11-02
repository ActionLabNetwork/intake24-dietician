<template>
  <v-main v-if="isProfileLoading" align="center">
    <v-container>
      <v-progress-circular indeterminate></v-progress-circular>
    </v-container>
  </v-main>
  <v-main v-else class="wrapper">
    <v-container>
      <v-row>
        <v-breadcrumbs :items="breadcrumbItems">
          <template v-slot:divider>
            <v-icon icon="mdi-chevron-right"></v-icon>
          </template>
        </v-breadcrumbs>
      </v-row>
      <v-row>
        <v-btn
          prepend-icon="mdi-chevron-left"
          flat
          class="text-none"
          variant="text"
          to="/dashboard/my-patients"
        >
          Back to patient list
        </v-btn>
      </v-row>
      <v-row class="mt-6">
        <v-col cols="2"><DetailsAndNavCard /></v-col>
        <v-col cols="10" class="px-16">
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DieticianProfileValues } from '@intake24-dietician/common/types/auth'
import DetailsAndNavCard from '@/components/patients/DetailsAndNavCard.vue'

// const { t } = useI18n<i18nOptions>()

const authStore = useAuthStore()
const { user, isProfileLoading } = storeToRefs(authStore)

const breadcrumbItems = ref([
  {
    title: 'My Patients',
    disabled: false,
    href: '/dashboard/my-patients',
  },
  {
    title: 'Patient records',
    disabled: false,
    href: '/dashboard/patient-records',
  },
])
const profileFormValues = ref<DieticianProfileValues>({
  firstName: '',
  middleName: '',
  lastName: '',
  emailAddress: '',
  mobileNumber: '',
  businessNumber: '',
  businessAddress: '',
  shortBio: '',
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

watch(user, newUser => {
  profileFormValues.value = {
    firstName: newUser?.dieticianProfile.firstName ?? '',
    middleName: newUser?.dieticianProfile.middleName ?? '',
    lastName: newUser?.dieticianProfile.lastName ?? '',
    emailAddress: newUser?.email ?? '',
    mobileNumber: newUser?.dieticianProfile.mobileNumber ?? '',
    businessNumber: newUser?.dieticianProfile.businessNumber ?? '',
    businessAddress: newUser?.dieticianProfile.businessAddress ?? '',
    shortBio: newUser?.dieticianProfile.shortBio ?? '',
    avatar: newUser?.dieticianProfile.avatar ?? null,
    createdAt: newUser?.dieticianProfile.createdAt ?? new Date(),
    updatedAt: newUser?.dieticianProfile.updatedAt ?? new Date(),
  }
})
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
