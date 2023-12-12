<template>
  <div>
    <v-menu transition="slide-y-transition" bottom>
      <template v-slot:activator="{ props }">
        <v-btn class="text-none" v-bind="props">
          Workspace <v-icon class="ml-2" icon="mdi-chevron-down" />
        </v-btn>
      </template>

      <v-card class="my-menu">
        <v-list>
          <v-list-subheader>Current Workspace</v-list-subheader>

          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            color="primary"
            variant="plain"
          >
            <template v-slot:prepend>
              <v-avatar color="primary">
                <span class="text-h5">D</span>
              </v-avatar>
            </template>

            <div>{{ item.text }}</div>
          </v-list-item>
        </v-list>

        <v-list>
          <v-list-subheader>Other Workspaces</v-list-subheader>

          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            color="primary"
            variant="tonal"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>

            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { useSurveys } from '@intake24-dietician/portal/queries/useSurveys'
import { ref, watch } from 'vue'

const surveysQuery = useSurveys()

const currentWorkspace = ref()

const items = [
  { text: 'Real-Time', icon: 'mdi-clock' },
  { text: 'Audience', icon: 'mdi-account' },
  { text: 'Conversions', icon: 'mdi-flag' },
]

watch(
  () => surveysQuery.data.value,
  newSurveysQueryData => {
    if (!newSurveysQueryData || !newSurveysQueryData.data.ok) return

    const surveys = newSurveysQueryData.data.value
    currentWorkspace.value = surveys[0]
  },
)
</script>

<style scoped lang="scss">
.my-menu {
  margin-top: 40px;
  contain: initial;
  overflow: visible;
}
.my-menu::before {
  position: absolute;
  content: '';
  top: 0;
  right: 10px;
  transform: translateY(-100%);
  width: 10px;
  height: 13px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 13px solid #fff;
}
</style>
