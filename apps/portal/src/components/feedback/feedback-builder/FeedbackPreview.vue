<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn color="primary" dark v-bind="props"> Open Dialog </v-btn>
        <slot name="button" v-bind="props"></slot>
      </template>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Feedback preview</v-toolbar-title>
          <v-toolbar-items>
            <v-btn variant="text" @click="dialog = false"> Close </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div class="pl-16 ml-3">
          {{ props.modules.map(m => m.feedback) }}
          <div class="mt-10">
            <p class="text-h2 font-weight-medium">Hi Mira</p>
            <p class="w-50 mt-4">
              Great job on completing your recall. Below, you can find a quick
              feedback based on your recall data submitted on Aug 1, 2023
            </p>
          </div>
        </div>
        <div v-if="modules && modules.length > 0" class="pa-14">
          <component
            :is="module.component"
            v-for="(module, index) in modules"
            :key="index"
            :feedback="module.feedback"
            :recalls-data="recallsData"
            :recall-date="recallDate"
            :feedback-editable="false"
            flat
          ></component>
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import { type Component, ref, computed, watchEffect } from 'vue'

interface Props {
  recallsData: IRecallExtended[]
  recallDate: Date
  modules: { component: Component; feedback: string }[]
}

const props = defineProps<Props>()

const selectedModules = computed(() => {
  return props.modules.length
})

watchEffect(() => {
  console.log(selectedModules.value)
  console.log({ props })
})

const dialog = ref(false)
</script>
