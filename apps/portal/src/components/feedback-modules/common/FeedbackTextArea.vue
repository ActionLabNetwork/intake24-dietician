<template>
  <div v-if="props.editable">
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
    <v-card class="pa-4 d-flex align-center" elevation="2">
      <div class="mr-4">
        <v-avatar size="x-large" :image="avatar" />
      </div>
      <div>
        <div class="font-weight-bold">{{ fullName }}</div>
        <div class="text-body-2">{{ feedback }}</div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { INPUT_DEBOUNCE_TIME } from '@intake24-dietician/portal/constants'
import { useAuthStore } from '@intake24-dietician/portal/stores/auth'
import { getDefaultAvatar } from '@/utils/profile'

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

const auth = useAuthStore()

const isEditing = ref(false)
const localFeedback = ref('')

const fullName = computed(() => {
  return `${auth.user?.dieticianProfile.firstName} ${auth.user?.dieticianProfile.lastName}`
})
const avatar = computed(
  () =>
    auth.user?.dieticianProfile.avatar ||
    getDefaultAvatar(auth.user?.email ?? ''),
)

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
