<template>
  <div
    class="bubble-container"
    :style="{
      display: 'flex',
      flexDirection: containerFlexDirection,
      alignItems: 'center',
    }"
  >
    <v-card class="arrow" :class="[props.placement]" />
    <v-card v-if="props.title" class="bubble" color="primary">
      <v-card-title>
        {{ props.title }}
      </v-card-title>
      <v-card-text v-if="props.description">
        {{ props.description }}
      </v-card-text>
      <v-card-actions>
        <v-row align="center" class="ml-2">
          <v-col class="page-number">{{ index + 1 }} of {{ numSteps }}</v-col>
          <v-spacer />
          <v-col @click="() => emits('previous')">
            <v-btn class="text-none"> Back </v-btn>
          </v-col>
          <v-col variant="flat">
            <v-btn
              class="text-none"
              @click="
                () => {
                  if (!props.isLast) emits('next')
                  else emits('finish')
                }
              "
              >{{ !props.isLast ? 'Next' : 'Finish' }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Placement = 'top' | 'bottom' | 'right' | 'left'

const props = defineProps<{
  title?: string
  description?: string
  isLast: boolean
  numSteps: number
  index: number
  placement: Placement
}>()
const emits = defineEmits<{
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'finish'): void
}>()

const containerFlexDirection = computed(() => {
  if (props.placement === 'top') {
    return 'column-reverse'
  } else if (props.placement === 'bottom') {
    return 'column'
  } else if (props.placement === 'left') {
    return 'row-reverse'
  } else {
    return 'row'
  }
})
</script>

<style scoped>
.page-number {
  font-size: 12px;
}

.bubble {
  /* background-color: rgb(var(--v-theme-primary)); */
  max-width: 400px;
  /* border-radius: 8px; */
  /* color: white; */
}

.arrow {
  width: 20px;
  height: 20px;
  transform: rotate(45deg);
  background-color: rgb(var(--v-theme-primary));
  z-index: 1;
  box-shadow: none;
}

.bubble-container {
  padding: 5px;
}

.arrow.bottom {
  transform: translateY(12px) rotate(45deg);
}
.arrow.top {
  transform: translateY(-12px) rotate(45deg);
}

.arrow.left {
  transform: translateX(-12px) rotate(45deg);
}

.arrow.right {
  transform: translateX(12px) rotate(45deg);
}
</style>
