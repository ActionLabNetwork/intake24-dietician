<template>
  <v-app-bar :elevation="2" flat class="app-bar">
    <v-app-bar-title>
      <div class="d-flex align-center">
        <v-img max-width="10rem" src="@/assets/logo.svg" class="ml-16" />
        <WorkspaceMenu class="ml-14" />
      </div>
    </v-app-bar-title>
    <template v-slot:append>
      <div v-if="mdAndUp" class="d-flex">
        <v-btn icon class="mr-5">
          <v-icon icon="mdi-bell-outline" size="large" />
        </v-btn>
        <BaseAvatar />
      </div>
      <div v-else>
        <v-btn icon class="mr-16" @click="drawer = !drawer">
          <v-icon :icon="drawer ? 'mdi-close' : 'mdi-menu'" size="x-large" />
        </v-btn>
      </div>
    </template>
  </v-app-bar>
  <NavigationDrawer
    :drawer="drawer"
    @change="
      newVal => {
        drawer = newVal
      }
    "
  />
</template>

<script lang="ts" setup>
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import NavigationDrawer from '@/components/app-bar/NavigationDrawer.vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { ref } from 'vue'
import WorkspaceMenu from '@intake24-dietician/portal/components/app-bar/WorkspaceMenu.vue'

const { mdAndUp } = useDisplay()
const drawer = ref(false)
</script>
<style scoped lang="scss">
.nav-items {
  $primary: #ee672d;

  list-style-type: none;
  display: flex;
  gap: 2rem;
  padding: 2rem;
  margin-left: 2rem;

  li {
    font-size: 1rem;

    a {
      text-decoration: none;
      font-weight: 400;
      color: #000;
    }

    .router-link-active {
      color: $primary;
    }
  }
}

@media print {
  .app-bar {
    display: none;
  }
}
</style>
