<template>
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list-item
      class="py-5"
      :prepend-avatar="profile?.avatar ?? getDefaultAvatar()"
      :title="`${profile?.firstName} ${profile?.lastName}`"
    ></v-list-item>
    <v-divider></v-divider>
    <v-list nav color="primary">
      <v-list-item
        v-for="item in navItems"
        :key="item.value"
        :title="item.title"
        :to="item.to"
      />
      <v-divider class="my-5"></v-divider>
      <v-list-item>
        <BasePreferences
          :user="_user"
          :show-avatar="false"
          :handle-logout="handleLogout"
        />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useLogout } from '@/mutations/useAuth'
import { useProfile } from '@/queries/useAuth'
import router from '@/router'
import { getDefaultAvatar, getFullName, getInitials } from '@/utils/profile'
import { useQueryClient } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import BasePreferences from '../common/BasePreferences.vue'

const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['auth'] })

const profileQuery = useProfile()
const logoutMutation = useLogout()
const profile = ref(profileQuery.data.value)

const navItems = [
  {
    title: 'My patients',
    value: 'myPatients',
    to: '/dashboard/my-profile',
  },
  {
    title: 'My surveys',
    value: 'mySurveys',
    to: '/dashboard/my-surveys',
  },
  {
    title: 'My profile',
    value: 'myProfile',
    to: '/dashboard/my-profile',
  },
]

const drawer = defineModel<boolean>('drawer')

const _user = ref({
  initials: '',
  fullName: '',
  email: '',
})

watch(
  () => profileQuery.data.value,
  newData => {
    if (!newData) return
    const { firstName, lastName } = newData
    const email = newData.user.email

    profile.value = newData

    _user.value.initials = getInitials(firstName, lastName ?? '')
    _user.value.fullName = getFullName(firstName, lastName ?? '')
    _user.value.email = email ?? ''
  },
)

watch(
  () => profileQuery.isError.value,
  isError => {
    if (!isError) return
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push({ path: '/auth/login' })
      },
    })
  },
)

const handleLogout = () => {
  logoutMutation.mutate(undefined, {
    onSuccess: () => {
      router.push({ path: '/auth/login' })
    },
  })
}
</script>
