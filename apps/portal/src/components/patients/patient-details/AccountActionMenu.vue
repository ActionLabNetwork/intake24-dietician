<template>
  <div class="text-center">
    <!-- Menu -->
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <!-- TODO: Fix this -->
        <v-btn
          v-show="false"
          color="neutral"
          v-bind="props"
          class="text-none"
          variant="outlined"
        >
          <span class="pr-2">Account action</span>
          <v-icon icon="mdi-dots-horizontal"></v-icon>
        </v-btn>
        <v-divider></v-divider>
      </template>

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
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Dialog -->
    <div class="text-center">
      <v-dialog v-model="dialog.show" width="auto">
        <v-card>
          <v-card-title>
            <p>Attention:</p>
          </v-card-title>
          <v-card-text>
            <p>
              Are you sure you want to
              {{ props.patient?.isArchived ? 'activate' : 'archive' }}
              patient:
            </p>
            <p>
              <span class="font-weight-bold">
                {{ fullName }}
              </span>
              account details?
            </p>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="dialog.show = false"> Cancel </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="dialog.confirmHandler"
            >
              Confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useRestorePatient,
  useDeletePatient,
} from '@intake24-dietician/portal/mutations/usePatients'
import { PatientWithUserDto } from '@intake24-dietician/common/entities-new/user.dto'

const props = defineProps<{
  patient: PatientWithUserDto | undefined
}>()

const emit = defineEmits<{ update: [null] }>()

const activatePatientMutation = useRestorePatient()
const deletePatientMutation = useDeletePatient()

const archiveOrActivateLabel = computed(() => {
  return activateOrDelete.value === 'activate'
    ? 'Activate patient account'
    : 'Archive patient account'
})

const activateOrDelete = computed((): 'activate' | 'delete' => {
  return props.patient?.isArchived ? 'activate' : 'delete'
})

const actions = computed(
  () =>
    [
      {
        // eslint-disable-next-line vue/no-ref-object-destructure
        title: archiveOrActivateLabel.value,
        handler: () => {
          dialog.value.show = true
        },
      },
      {
        title: 'Transfer patient account',
        handler: () => {
          // TODO: Implement Transfer patient account handler here
          console.log('Transfer patient account')
        },
      },
    ] as const,
)

const fullName = computed(() => {
  return `${props.patient?.firstName} ${props.patient?.lastName}`
})

const dialog = ref({
  show: false,
  confirmHandler: () => {
    if (activateOrDelete.value === 'activate') {
      activatePatientMutation.mutate(props.patient?.user.id)
      emit('update', null)
      dialog.value.show = false
    } else {
      deletePatientMutation.mutate(props.patient?.user.id)
      emit('update', null)
      dialog.value.show = false
    }
  },
})

type Action = (typeof actions.value)[number]

const handleMenuItemClick = ({ action }: { action: Action }) => {
  action?.handler()
}
</script>
<style scoped lang="scss">
.list-item:not(:last-child) {
  border-bottom: 1px solid lightgray;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
