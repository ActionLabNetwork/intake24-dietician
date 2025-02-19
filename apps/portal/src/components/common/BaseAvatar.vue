<template>
  <v-container v-if="isProfileLoading" align="center">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-container>
  <v-container v-else fluid>
    <v-row justify="center">
      <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn class="mr-16 mr-3" v-bind="props">
            <v-avatar :image="user?.avatar || getDefaultAvatar()"></v-avatar>
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
import { useClinicStore } from '@/stores/clinic'
import { useProfile } from '@/queries/useAuth'
import router from '@/router'
import { ref, watch } from 'vue'
import { getInitials, getFullName, getDefaultAvatar } from '@/utils/profile'

const clinicStore = useClinicStore()
const { data, isPending: isProfileLoading } = useProfile()

const user = ref(data.value)
const _user = ref({
  initials: '',
  fullName: '',
  email: '',
})

watch(
  data,
  newData => {
    if (!newData) return

    const { firstName, lastName } = newData
    const email = newData.user.email

    user.value = newData

    _user.value.initials = getInitials(firstName, lastName ?? '')
    _user.value.fullName = getFullName(firstName, lastName ?? '')
    _user.value.email = email ?? ''
  },
  { immediate: true },
)

const logoutMutation = useLogout()
const handleLogout = () => {
  logoutMutation.mutate(undefined, {
    onSuccess: () => {
      clinicStore.reset()
      router.push({ path: '/auth/login' })
    },
  })
}
</script>
