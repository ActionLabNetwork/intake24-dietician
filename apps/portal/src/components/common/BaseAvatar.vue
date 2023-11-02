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
                user?.dieticianProfile.avatar ||
                getDefaultAvatar(user?.email ?? '')
              "
            ></v-avatar>
            <v-icon icon="mdi-chevron-down" size="large" />
          </v-btn>
        </template>
        <BasePreferences
          :user="_user"
          :show-avatar="!!_user.initials"
          :handle-logout="handleLogout"
        />
      </v-menu>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import BasePreferences from './BasePreferences.vue'
import { useLogout } from '@/mutations/useAuth'
import { useProfile } from '@/queries/useAuth'
import router from '@/router'
import { useQueryClient } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import { getInitials, getFullName, getDefaultAvatar } from '@/utils/profile'

const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['auth'] })

const { data, isLoading: isProfileLoading } = useProfile()

const user = ref(data.value?.data.data.user)
const _user = ref({
  initials: '',
  fullName: '',
  email: '',
})

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
