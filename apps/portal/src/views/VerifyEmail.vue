<template>
  <v-row no-gutters>
    <v-col cols="5">
      <div
        class="d-flex px-16 w-full h-screen align-items-center flex-column justify-space-around"
      >
        <div v-if="status === 'pending'">
          <h1>Loading</h1>
        </div>
        <div v-if="status === 'error'">
          <h1>Failed to verify email</h1>
          <h2>The token is invalid or has expired.</h2>
        </div>
        <div v-if="status === 'success'">
          <h1>Your email has been verified</h1>
          <h2>You can now close this page.</h2>
        </div>
      </div>
    </v-col>
    <v-col cols="7">
      <div class="hero-image" />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useVerifyEmail } from '../mutations/useAuth'

const route = useRoute()
const token = route.query['token'] as string

const { mutate, status } = useVerifyEmail()

mutate(token)
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

$base-color: #000;

h1 {
  color: $base-color;
  font-size: 1.5rem;
  font-weight: 600;
}

h2 {
  color: $base-color;
  font-size: 0.875rem;
  font-weight: 400;
}
</style>
