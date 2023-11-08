<template>
  <v-row no-gutters>
    <v-col cols="5">
      <ResetPasswordForm :token="token!" />
    </v-col>
    <v-col cols="7">
      <div class="hero-image" />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import ResetPasswordForm from '@/components/form/ResetPasswordForm.vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const token = route.query['token']?.toString()

if (!token) {
  router.push({ name: 'Login' })
}
</script>

<style scoped lang="scss">
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
