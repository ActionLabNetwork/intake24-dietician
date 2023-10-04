<template>
  <v-container fluid>
    <v-row justify="center">
      <v-menu rounded :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn class="mr-16 mr-3" v-bind="props">
            <v-avatar image="@/assets/dashboard/avatar.svg"></v-avatar>
            <v-icon icon="mdi-chevron-down" size="large" />
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="brown">
                <span class="text-h5">{{ user.initials }}</span>
              </v-avatar>
              <h3>{{ user.fullName }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <LanguageSelect />
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text"> Log Out </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import LanguageSelect from '@/components/app-bar/LanguageSelect.vue'

const user = {
  initials: 'JD',
  fullName: 'John Doe',
  email: 'john.doe@doe.com',
}
</script>
