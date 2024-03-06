<template>
  <v-row no-gutters>
    <v-col :cols="formCols">
      <div :class="!md && mdAndDown && 'hero-image-full'" />
      <ForgotPasswordForm />
    </v-col>
    <v-col v-if="mdAndUp" :cols="heroImageCols">
      <div :class="mdAndUp ? 'hero-image' : 'hero-image-full'" />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import ForgotPasswordForm from '@/components/form/ForgotPasswordForm.vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndUp, md, mdAndDown } = useDisplay()
const formCols = computed(() => (mdAndUp.value ? 5 : 12))
const heroImageCols = computed(() => (mdAndUp.value ? 7 : 0))
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

.hero-image-full {
  background-image: url('@/assets/auth/register/RegisterHero.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.2;
  width: 100%;
  position: absolute;
  height: 100%;
}
</style>
