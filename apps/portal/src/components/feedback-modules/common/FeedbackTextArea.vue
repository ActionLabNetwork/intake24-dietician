<template>
  <div v-if="editable">
    <div class="font-weight-bold">
      Feedback
      <v-row class="mt-1 justify-space-between">
        <v-col cols="10">
          <v-textarea
            v-model="localFeedback"
            variant="solo-filled"
            :readonly="!isEditing"
            @update:model-value="handleFeedbackUpdate"
          ></v-textarea>
        </v-col>
        <v-col cols="2" class="px-1">
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
  <div v-else>
    <div class="font-weight-bold">Feedback</div>
    <div class="mt-1">{{ props.feedback }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { INPUT_DEBOUNCE_TIME } from '@intake24-dietician/portal/constants'

const props = withDefaults(
  defineProps<{
    feedback: string
    editable: boolean
  }>(),
  {
    editable: true,
  },
)

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const isEditing = ref(false)
const localFeedback = ref('')

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const handleFeedbackUpdate = useDebounceFn((_feedback: string) => {
  localFeedback.value = _feedback
  emit('update:feedback', localFeedback.value)
}, INPUT_DEBOUNCE_TIME)

watch(
  () => props.feedback,
  newFeedback => {
    console.log({ newFeedback })
    localFeedback.value = newFeedback
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.btn {
  background-color: #fde4a5;
  border-radius: 2rem;
}
</style>
