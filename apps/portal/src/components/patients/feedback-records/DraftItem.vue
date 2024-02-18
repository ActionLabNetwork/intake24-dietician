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
          @click="deleteDraft().showConfirmDialog()"
        />
      </div>
    </div>
  </v-card>
  <DialogDraftDelete
    v-model="confirmDialog"
    :on-confirm="
      async () => {
        await deleteDraft().submit()
      }
    "
  />
</template>

<script setup lang="ts">
import { useDeleteDraft } from '@intake24-dietician/portal/mutations/useFeedback'
import DialogDraftDelete from './DialogDraftDelete.vue'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'

interface DraftItem {
  draftId: number
  modified: string
  recallDates: string[]
}

const props = defineProps<DraftItem>()
defineEmits<{ buttonClick: [] }>()

const deleteDraftMutation = useDeleteDraft()
const $toast = useToast()

const confirmDialog = ref(false)

const deleteDraft = () => {
  const showConfirmDialog = () => {
    confirmDialog.value = true
  }

  const submit = async () =>
    await deleteDraftMutation.mutateAsync(props.draftId, {
      onSuccess: () => $toast.success('Draft deleted'),
    })

  return { showConfirmDialog, submit }
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
