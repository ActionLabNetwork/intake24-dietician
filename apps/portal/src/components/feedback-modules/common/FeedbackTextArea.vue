<template>
  <div>
    <div class="font-weight-bold">
      Feedback
      <v-row class="mt-1">
        <v-col cols="11">
          <v-textarea
            v-model="feedback"
            variant="solo-filled"
            :readonly="!isEditing"
          ></v-textarea>
        </v-col>
        <v-col cols="1">
          <v-btn
            v-if="!isEditing"
            append-icon="mdi-pencil-outline"
            class="btn text-none"
            @click="toggleEdit"
          >
            Edit
          </v-btn>
          <v-btn
            v-else
            append-icon="mdi-check-outline"
            class="btn text-none"
            @click="toggleEdit"
          >
            Save
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isEditing = ref(false)
const feedback = ref('')

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}
</script>

<style scoped lang="scss">
.btn {
  background-color: #fde4a5;
  border-radius: 2rem;
}
</style>
