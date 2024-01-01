<template>
  <v-app>
    <default-bar />
    <default-view />
    <vue-query-devtools />
  </v-app>
</template>

<script lang="ts" setup>
import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>
