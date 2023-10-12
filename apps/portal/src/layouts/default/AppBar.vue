<template>
  <v-app-bar :elevation="2" flat>
    <v-app-bar-title>
      <div class="d-flex">
        <v-img max-width="10rem" src="@/assets/logo.svg" class="ml-16" />

        <ul v-if="mdAndUp" class="nav-items">
          <li>
            <router-link to="/dashboard/my-patients">My patients</router-link>
          </li>
          <li>
            <router-link to="/dashboard/master-settings">
              Master settings
            </router-link>
          </li>
          <li>
            <router-link to="/dashboard/my-profile">My profile</router-link>
          </li>
        </ul>
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
  <NavigationDrawer :drawer="drawer" @change="newVal => (drawer = newVal)" />
</template>

<script lang="ts" setup>
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import NavigationDrawer from '@/components/app-bar/NavigationDrawer.vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { ref } from 'vue'

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
</style>
