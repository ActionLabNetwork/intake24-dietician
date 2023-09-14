<template>
  <v-row no-gutters>
    <v-col cols="5">
      <LoginForm />
    </v-col>
    <v-col cols="7">
      <div class="hero-image" />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import LoginForm from '@/components/form/LoginForm.vue'
</script>

<style>
.hero-image {
  background-image: url('@/assets/auth/register/RegisterHero.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 60%;
  position: absolute;
  height: 100%;
}
</style>
