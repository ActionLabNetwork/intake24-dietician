<template>
  <v-card class="mx-auto py-2 px-5 card" flat>
    <div class="d-flex justify-space-between align-center">
      <div class="py-2">
        <p class="mb-2">
          <span class="font-weight-medium">Last edited:</span>
          {{ modified }}
        </p>
        <p>
          <span class="font-weight-medium">Recall date:</span>
          {{ recallDates[0] }} - {{ recallDates[1] }}
        </p>
      </div>
      <div>
        <v-btn
          class="text-capitalize"
          variant="outlined"
          @click="$emit('buttonClick')"
        >
          Edit draft
        </v-btn>
        <v-btn
          icon="mdi-delete-outline"
          class="ml-2"
          variant="flat"
          @click="deleteDraft"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useDeleteDraft } from '@intake24-dietician/portal/mutations/useFeedback'
interface DraftItem {
  draftId: number
  modified: string
  recallDates: string[]
}

const props = defineProps<DraftItem>()
defineEmits<{ buttonClick: [] }>()

const deleteDraftMutation = useDeleteDraft()

const deleteDraft = () => {
  deleteDraftMutation.mutate(props.draftId)
}
</script>

<style scoped lang="scss">
.card {
  border-radius: 8px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: #fff;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
}
</style>
