<template>
  <v-card>
    <v-card-text>
      <div class="mx-auto text-center">
        <!-- Avatar -->
        <div v-if="showAvatar">
          <v-avatar color="brown" class="mb-3">
            <span class="text-h5">{{ user.initials }}</span>
          </v-avatar>
          <h3>{{ user.fullName }}</h3>
          <p class="text-caption mt-1">
            {{ user.email }}
          </p>
          <v-divider class="my-3"></v-divider>
        </div>

        <!-- My Profile button -->
        <div>
          <router-link
            :to="{ name: 'My Profile' }"
            class="text-decoration-none text-black"
          >
            {{ t('appBar.my_profile') }}
          </router-link>
        </div>
        <v-divider class="my-3"></v-divider>

        <!-- Language select dropdown -->
        <LanguageSelect />
        <v-divider class="my-3"></v-divider>

        <!-- Log out button -->
        <v-btn rounded variant="text" @click="handleLogout"> Log Out </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import LanguageSelect from '@/components/app-bar/LanguageSelect.vue'
import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'

defineProps<{
  user: { initials: string; fullName: string; email: string }
  showAvatar: boolean
  handleLogout: () => void
}>()

const { t } = useI18n<i18nOptions>()
</script>
