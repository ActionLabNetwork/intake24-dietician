<template>
  <v-row no-gutters>
    <v-col cols="5">
      <LoginForm />
    </v-col>
    <v-col cols="7">
      <v-img
        aspect-ratio="16/9"
        max-height="screen"
        cover
        src="../assets/auth/login/LoginHero.png"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import LoginForm from '../components/LoginForm.vue'
</script>
