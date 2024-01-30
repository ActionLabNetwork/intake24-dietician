<template>
  <pre>{{ registerSteps }}</pre>
  <v-row v-if="currentStep === 'auth'" no-gutters>
    <v-col :cols="formCols">
      <div :class="!md && mdAndDown && 'hero-image-full'" />
      <RegisterForm @submit="handleAuthStepSubmit" />
    </v-col>
    <v-col v-if="mdAndUp" :cols="heroImageCols">
      <div :class="mdAndUp ? 'hero-image' : 'hero-image-full'" />
    </v-col>
  </v-row>
  <v-row v-if="currentStep === 'profile'" class="wrapper">
    <v-col>
      <RegisterProfileForm
        :email="registerSteps.auth.values?.email ?? ''"
        @submit="handleProfileStepSubmit"
      />
    </v-col>
  </v-row>
  <v-row v-if="currentStep === 'clinic'" class="wrapper">
    <v-col>
      <RegisterClinicForm
        @submit="
          values => {
            registerSteps = {
              ...registerSteps,
              clinic: {
                ...registerSteps.clinic,
                values,
              },
            }
            currentStep = 'clinic'
          }
        "
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import RegisterForm from '@/components/form/RegisterForm.vue'
import RegisterClinicForm from '@/components/form/RegisterClinicForm.vue'
import RegisterProfileForm from '@/components/form/RegisterProfileForm.vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'
import type { DieticianCreateDto } from '@intake24-dietician/common/entities-new/user.dto'
import type { RegisterDto } from '@intake24-dietician/common/entities-new/auth.dto'
import { useRegister } from '../mutations/useAuth'

interface RegisterSteps {
  auth: { title: string; values: RegisterDto | null }
  profile: { title: string; values: DieticianCreateDto | null }
  clinic: { title: string; values: DieticianCreateDto | null }
}

const registerMutation = useRegister()
const { mdAndUp, md, mdAndDown } = useDisplay()
const formCols = computed(() => (mdAndUp.value ? 5 : 12))
const heroImageCols = computed(() => (mdAndUp.value ? 7 : 0))

const registerSteps = ref<RegisterSteps>({
  auth: { title: 'Auth', values: null },
  profile: { title: 'Profile', values: null },
  clinic: { title: 'Clinic', values: null },
})

const currentStep = ref<keyof typeof registerSteps.value>('auth')

const handleAuthStepSubmit = (values: RegisterDto) => {
  registerSteps.value = {
    ...registerSteps.value,
    auth: {
      ...registerSteps.value.auth,
      values,
    },
  }
  currentStep.value = 'profile'
}

const handleProfileStepSubmit = (values: DieticianCreateDto) => {
  registerSteps.value = {
    ...registerSteps.value,
    profile: {
      ...registerSteps.value.profile,
      values,
    },
  }
  currentStep.value = 'clinic'

  const userValues = registerSteps.value.auth.values
  const profileValues = registerSteps.value.profile.values

  registerMutation.mutate(
    {
      user: {
        email: userValues?.email ?? '',
        password: userValues?.password ?? '',
      },
      profile: {
        firstName: profileValues?.firstName ?? '',
        lastName: profileValues?.lastName ?? '',
        middleName: profileValues?.middleName ?? '',
        avatar: profileValues?.avatar ?? '',
        mobileNumber: profileValues?.mobileNumber ?? '',
        businessAddress: profileValues?.businessAddress ?? '',
        businessNumber: profileValues?.businessNumber ?? '',
        shortBio: profileValues?.shortBio ?? '',
      },
    },
    {
      onError: () => {
        console.log('error')
      },
      onSuccess: () => {
        console.log('success')
      },
    },
  )
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

.hero-image {
  background-image: url('@/assets/auth/register/RegisterHero.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 60%;
  position: absolute;
  height: 100%;
}

.hero-image-full {
  background-image: url('@/assets/auth/register/RegisterHero.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.2;
  width: 100%;
  position: absolute;
  height: 100%;
}
</style>
