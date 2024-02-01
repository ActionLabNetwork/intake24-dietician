<template>
  <v-card class="mx-auto pa-5 card">
    <div class="d-flex justify-space-between align-center">
      <div class="d-flex align-center justify-center">
        <div>
          <p>
            <span class="font-weight-medium">Shared:</span>
            {{ shared }}
          </p>
        </div>
        <div class="ml-2">
          <v-chip
            variant="outlined"
            :color="shareType === 'Tailored' ? 'success' : 'warning'"
            :text="shareType"
          >
          </v-chip>
        </div>
      </div>
      <div>
        <v-btn
          :append-icon="
            showOutputPreview ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          class="text-capitalize"
          variant="text"
          @click="showOutputPreview = !showOutputPreview"
        >
          {{ showOutputPreview ? 'Hide' : 'Preview' }}
        </v-btn>
        <v-btn
          variant="flat"
          icon="mdi-download-outline"
          class="ml-5"
          @click="$emit('buttonClick')"
        />
      </div>
    </div>
  </v-card>
  <div class="mb-5">
    <ViewFeedback
      v-if="showOutputPreview"
      class="my-0"
      :feedback-id="shareId"
      hide-back-button
      constrain-output-height
    />
  </div>
</template>
<script setup lang="ts">
import ViewFeedback from '@intake24-dietician/portal/views/dashboard/patients/feedback-records/ViewFeedback.vue'
import { ref } from 'vue'

interface SharedItem {
  shareId: string
  shared: string
  shareType: 'Tailored' | 'Auto'
  showOutputPreview: boolean
}

const props = withDefaults(defineProps<SharedItem>(), {
  showOutputPreview: false,
})
defineEmits<{ buttonClick: [] }>()

// eslint-disable-next-line vue/no-setup-props-destructure
const showOutputPreview = ref(props.showOutputPreview)
</script>

<style scoped lang="scss">
.card {
  border-radius: 8px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: #fff;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
}
</style>
