<template>
  <div>
    <v-menu transition="slide-y-transition" location="bottom">
      <template #activator="{ props }">
        <v-btn class="text-none" v-bind="props">
          Clinics <v-icon class="ml-2" icon="mdi-chevron-down" />
        </v-btn>
      </template>

      <v-card class="my-menu pa-2">
        <div v-if="clinics.length === 0" class="pa-2">
          <p class="text-center text-body-1">No clinics...</p>
        </div>
        <div v-else>
          <v-list v-if="currentClinic" style="overflow: hidden">
            <v-list-subheader>Current Clinic</v-list-subheader>
            <ClinicMenuItem
              :clinic="currentClinic"
              @click="
                router.push({
                  name: 'Survey Patient List',
                  params: { surveyId: currentClinic.id },
                })
              "
            />
          </v-list>
          <v-list v-if="clinics.length > 1">
            <v-list-subheader>Other Clinics</v-list-subheader>
            <ClinicMenuItem
              v-for="clinic in otherClinics"
              :key="clinic.id"
              :value="clinic"
              :clinic="clinic"
              variant="plain"
              @click="
                () => {
                  currentClinic = clinic
                  router.push({
                    name: 'Survey Patient List',
                    params: { surveyId: currentClinic.id },
                  })
                }
              "
            />
          </v-list>
        </div>
        <div class="pa-3">
          <v-btn
            width="100%"
            color="primary"
            class="text-none"
            href="/dashboard/my-surveys/add-survey"
          >
            Add new clinic <v-icon class="ml-2" icon="mdi-plus" />
          </v-btn>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'
import ClinicMenuItem from './ClinicMenuItem.vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { watch } from 'vue'
import { VCard, VMenu, VBtn } from 'vuetify/lib/components/index.mjs'

const router = useRouter()
const route = useRoute()

const clinicStore = useClinicStore()
const { currentClinic, clinics, otherClinics } = storeToRefs(clinicStore)

watch(
  () => route,
  async () => {
    await clinicStore.refetchClinics()
    clinicStore.switchToFirstClinic()
  },
  { immediate: true },
)

clinicStore.$subscribe(async () => {
  clinicStore.switchCurrentClinic(Number(route.params.surveyId))
})
</script>

<style scoped lang="scss">
.my-menu {
  margin-top: 40px;
  contain: initial;
  overflow: visible !important;
  border-radius: 10px !important;
}
.my-menu::before,
.my-menu::after {
  position: absolute;
  content: '';
  top: 0;
  left: 30px;
  transform: translateY(-90%);
  width: 10px;
  height: 12px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

.my-menu::before {
  border-bottom: 13px solid #fff;
  z-index: -1;
}

.my-menu::after {
  border-bottom: 13px solid #000;
  filter: blur(25px);
  opacity: 0.6;
  transform: translateY(-15px);
  z-index: 2;
}
</style>
