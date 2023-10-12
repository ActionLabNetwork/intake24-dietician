<template>
  <v-card>
    <v-card-text>
      <div class="mx-auto text-center">
        <div v-if="showAvatar">
          <v-avatar color="brown">
            <span class="text-h5">{{ user.initials }}</span>
          </v-avatar>
          <h3>{{ user.fullName }}</h3>
          <p class="text-caption mt-1">
            {{ user.email }}
          </p>
          <v-divider class="my-3"></v-divider>
        </div>
        <LanguageSelect />
        <v-divider class="my-3"></v-divider>
        <v-btn rounded variant="text" @click="handleLogout"> Log Out </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import LanguageSelect from '@/components/app-bar/LanguageSelect.vue'

defineProps<{
  user: { initials: string; fullName: string; email: string }
  showAvatar: boolean
  handleLogout: () => void
}>()
</script>
