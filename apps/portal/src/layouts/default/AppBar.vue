<template>
  <v-app-bar :elevation="2" class="app-bar">
    <v-app-bar-title>
      <div class="d-flex align-center">
        <v-img
          max-width="10rem"
          src="@/assets/logo.svg"
          class="ml-13"
          style="cursor: pointer"
          @click="clinicStore.navigateToSurveyPatientList"
        />
        <ClinicMenu class="ml-14" />
      </div>
    </v-app-bar-title>
    <template #append>
      <div v-if="mdAndUp" class="d-flex">
        <v-btn icon class="mr-5">
          <v-icon icon="mdi-bell-outline" size="large" />
        </v-btn>
        <div>
          <BaseAvatar />
        </div>
      </div>
      <div v-else>
        <v-btn icon class="mr-16" @click="drawer = !drawer">
          <v-icon :icon="drawer ? 'mdi-close' : 'mdi-menu'" size="x-large" />
        </v-btn>
      </div>
    </template>
  </v-app-bar>
  <NavigationDrawer
    v-model:drawer="drawer"
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
import ClinicMenu from '@intake24-dietician/portal/components/app-bar/ClinicMenu.vue'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'

const { mdAndUp } = useDisplay()
const clinicStore = useClinicStore()

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
