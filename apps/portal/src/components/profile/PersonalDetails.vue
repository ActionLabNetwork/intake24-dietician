<template>
  <div>
    <p class="font-weight-medium">Your personal details</p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col class="v-col-2" align="center">
            <v-avatar
              image="@/assets/dashboard/avatar.svg"
              size="x-large"
              class="avatar mx-auto"
            />
            <p class="mt-5 text-center font-weight-medium">Upload image</p>
          </v-col>
          <v-divider vertical class="mx-5"></v-divider>
          <v-col>
            <v-form v-model="form" @submit.prevent="handleSubmit">
              <!-- First name -->
              <BaseInput
                type="text"
                name="firstName"
                autocomplete="given-name"
                :value="firstName"
                class="base-input"
                @update="(newVal: string) => (firstName = newVal)"
              >
                <span class="input-label">First name </span>
                <span class="input-label suffix">(required)</span>
              </BaseInput>
              <!-- Middle name -->
              <BaseInput
                type="text"
                name="middleName"
                autocomplete="additional-name"
                :value="middleName"
                @update="(newVal: string) => (middleName = newVal)"
              >
                <p class="input-label">Middle name</p>
              </BaseInput>
              <!-- Last name -->
              <BaseInput
                type="text"
                name="lastName"
                autocomplete="family-name"
                :value="lastName"
                @update="(newVal: string) => (lastName = newVal)"
              >
                <p class="input-label">Last name</p>
              </BaseInput>
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/form/BaseInput.vue'

import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

const form = ref(null)
const firstName = ref('')
const middleName = ref('')
const lastName = ref('')

const handleSubmit = () => {}
</script>
<style scoped lang="scss">
.avatar {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
}

.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
