<template>
  <v-container
    class="d-flex justify-space-between align-center w-100 pa-0 pr-6"
  >
    <div class="d-flex align-center">
      <div>
        <v-avatar v-if="workspace" :color="workspace.avatarColor">
          <span class="text-h5">
            {{ workspace.surveyName[0]?.toLocaleUpperCase() }}
          </span>
        </v-avatar>
      </div>
      <div class="ml-4">
        <p class="text-h6 font-weight-bold">{{ workspace?.surveyName }}</p>
        <p class="text-subtitle-1">ID: {{ workspace?.id }}</p>
      </div>
    </div>
    <div v-if="workspace?.intake24SurveyId">
      <v-icon
        icon="mdi-cog-outline"
        class="hoverable"
        @click="
          router.push({
            name: 'Survey Master Settings',
            params: { surveyId: route.params['surveyId'] as string },
          })
        "
      />
      <v-btn variant="flat" class="ml-6 hoverable" style="background: inherit">
        <v-icon icon="mdi-dots-horizontal"></v-icon>
        <v-menu activator="parent">
          <v-list
            item-props
            nav
            @click:select="
              value => handleMenuItemClick({ action: value.path[0] } as any)
            "
          >
            <v-list-item
              v-for="(item, index) in actions"
              :key="index"
              :value="item"
              class="list-item"
            >
              <v-list-item-title class="d-flex align-center">
                <v-icon icon="mdi-trash-can-outline"></v-icon>
                <span class="ml-2">{{ item.title }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </div>
  </v-container>
  <!-- Dialog -->
  <div class="text-center">
    <v-dialog v-model="dialog.show" width="auto">
      <v-card>
        <v-card-title>
          <p>Attention:</p>
        </v-card-title>
        <v-card-text>
          <p>Are you sure you want to delete {{ workspace?.surveyName }}?</p>
          <p>This action is irreversible</p>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn @click="dialog.show = false"> Cancel </v-btn>
          <v-btn color="primary" variant="flat" @click="dialog.confirmHandler">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useDeleteSurvey } from '@intake24-dietician/portal/mutations/useSurvey'
import { useWorkspaceStore } from '@intake24-dietician/portal/stores/workspace'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const workspaceStore = useWorkspaceStore()
const { currentWorkspace: workspace } = storeToRefs(workspaceStore)

const router = useRouter()
const route = useRoute()
const deleteSurveyMutation = useDeleteSurvey()

const dialog = ref({
  show: false,
  confirmHandler: () => {
    dialog.value.show = false

    if (!workspace.value) return
    deleteSurveyMutation.mutate(
      { id: workspace.value.id },
      {
        onSuccess: async () => {
          await workspaceStore.refetchWorkspaces()
          workspaceStore.switchToFirstWorkspace()
        },
      },
    )
  },
})

const actions = computed(
  () =>
    [
      {
        // eslint-disable-next-line vue/no-ref-object-destructure
        title: 'Delete clinic',
        handler: () => {
          dialog.value.show = true
        },
      },
    ] as const,
)

type Action = (typeof actions.value)[number]
const handleMenuItemClick = ({ action }: { action: Action }) => {
  action?.handler()
}
</script>

<style scoped>
.hoverable {
  transition: transform 0.3s;
}

.hoverable:hover {
  transform: scale(1.1);
  cursor: pointer;
}
</style>
