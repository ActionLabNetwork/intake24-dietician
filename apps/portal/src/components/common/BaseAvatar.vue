<template>
  <v-container v-if="isProfileLoading" align="center">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-container>
  <v-container v-else fluid>
    <v-row justify="center">
      <v-menu rounded :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn class="mr-16 mr-3" v-bind="props">
            <v-avatar
              :image="
                user?.dieticianProfile.avatar ?? '@/assets/dashboard/avatar.svg'
              "
            ></v-avatar>
            <v-icon icon="mdi-chevron-down" size="large" />
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="brown">
                <span class="text-h5">{{ _user.initials }}</span>
              </v-avatar>
              <h3>{{ _user.fullName }}</h3>
              <p class="text-caption mt-1">
                {{ _user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <LanguageSelect />
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="handleLogout">
                Log Out
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import LanguageSelect from '@/components/app-bar/LanguageSelect.vue'
import { useLogout } from '@/mutations/useAuth'
import { useProfile } from '@/queries/useAuth'
import router from '@/router'
import { useQueryClient } from '@tanstack/vue-query'
// import { useAuthStore } from '@/stores/auth'
// import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

// const authStore = useAuthStore()
// const { user, isProfileLoading } = storeToRefs(authStore)
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['auth'] })

const { data, isLoading: isProfileLoading } = useProfile()

const user = ref(data.value?.data.data.user)

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0).toUpperCase()}${lastName
    .charAt(0)
    .toUpperCase()}`
}

const getFullName = (firstName = '', lastName = '') => {
  return `${firstName} ${lastName}`.trim()
}

watch(data, newData => {
  if (newData) {
    const {
      firstName,
      lastName,
      emailAddress: email,
    } = newData.data.data.user.dieticianProfile

    user.value = newData.data.data.user

    _user.value.initials = getInitials(firstName, lastName)
    _user.value.fullName = getFullName(firstName, lastName)
    _user.value.email = email ?? ''
  }
})

const logoutMutation = useLogout()

const _user = ref({
  initials: 'JD',
  fullName: ``,
  email: '',
})

const handleLogout = () => {
  logoutMutation.mutate(
    {},
    {
      onSuccess: () => {
        router.push({ path: '/auth/login' })
      },
    },
  )
}
</script>
