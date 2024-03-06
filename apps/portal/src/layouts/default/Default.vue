<template>
  <v-app>
    <default-bar />
    <default-view class="wrapper" />
    <vue-query-devtools />
  </v-app>
</template>

<script lang="ts" setup>
import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<style scoped lang="scss">
.wrapper {
  background: rgb(252, 249, 244);
}

@media print {
  .wrapper {
    background: white;
  }
}
</style>
