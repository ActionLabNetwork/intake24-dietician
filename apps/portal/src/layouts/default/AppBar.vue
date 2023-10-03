<template>
  <v-app-bar :elevation="2">
    <v-app-bar-title>
      <div class="d-flex">
        <v-img max-width="10rem" src="@/assets/logo.svg" class="pl-3 ml-16" />

        <ul class="nav-items">
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
    <div>
      <v-btn icon class="mr-5">
        <v-icon icon="mdi-bell-outline" size="large" />
      </v-btn>
      <v-btn class="mr-16 mr-3">
        <v-avatar image="@/assets/dashboard/avatar.png"></v-avatar>
        <v-icon icon="mdi-chevron-down" size="large" />
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.path)
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
