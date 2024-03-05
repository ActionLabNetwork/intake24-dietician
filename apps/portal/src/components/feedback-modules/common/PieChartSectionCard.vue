<template>
  <v-row>
    <v-col
      cols="12"
      md="12"
      class="d-flex align-center flex-wrap justify-space-between px-3 px-lg-0"
    >
      <div class="font-weight-medium">{{ label }}</div>
      <div class="d-print-none" :class="{ 'd-none': previewing }">
        <v-btn
          class="accordion-icon"
          :class="{
            'rotate-expand-icon': !isPlusIcon,
            transition: isTransition,
          }"
          icon="mdi-close"
          variant="flat"
          @click="toggleIcon"
        />
      </div>
    </v-col>
    <v-col
      cols="12"
      md="12"
      class="wrapper d-flex flex-column mx-auto"
      :style="[
        wrapperStyle,
        { background: expand ? colors.backgroundColor : 'inherit' },
      ]"
    >
      <v-expand-transition>
        <ul v-show="expand">
          <v-row class="py-2 px-6 font-weight-bold">
            <v-col cols="8" class="list-header d-flex align-center">
              Top food items
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="3" class="list-header text-center">
              {{ props.unitOfMeasure?.description }}
            </v-col>
          </v-row>
          <li
            v-for="food in formattedFoods"
            :key="food.name + food.servingWeight + food.value"
            class="energy-value d-flex"
          >
            <div class="w-100">
              <div class="d-flex justify-space-between">
                <div class="w-75">
                  <p>{{ food.name }} {{ food.servingWeight }}</p>
                </div>
                <div class="font-weight-bold">
                  {{ usePrecision(food.value, 2)
                  }}{{ unitOfMeasure?.unit.symbol }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import chroma from 'chroma-js'
import { MealCardProps } from '../types'
import { useProcessRecallFoods } from '@/composables/useProcessRecallFoods'
import { useRoute } from 'vue-router'
import { usePrecision } from '@vueuse/math'

const props = defineProps<MealCardProps>()

const route = useRoute()
const previewing = route.query.preview === 'true'

const isPlusIcon = ref(true)
const isTransition = ref(true)
const expand = ref(true)

const { formattedFoods } = useProcessRecallFoods(computed(() => props.foods))

const toggleIcon = () => {
  isTransition.value = true
  isPlusIcon.value = !isPlusIcon.value

  if (isPlusIcon.value) {
    expand.value = true
  } else {
    expand.value = false
  }

  setTimeout(() => {
    isTransition.value = false
  }, 300)
}

const wrapperStyle = computed(() => ({
  '--line-color': props.colors.valueCardBorderColor,
  '--bg-color': chroma(props.colors.backgroundColor)
    .darken(2)
    .saturate(4)
    .hex(),
  '--header-color': chroma(props.colors.backgroundColor)
    .darken(1)
    .saturate(1)
    .hex(),
}))
</script>

<style scoped>
.wrapper {
  padding: 1rem;
  border-radius: 2px;
  height: 100%;
  position: relative;
  width: 90%;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--bg-color);
    border-radius: 20px;
  }
}

.list-header {
  background: var(--header-color);
  padding: 4px 8px;
  border-radius: 2px;
  margin-bottom: 1rem;
}

.energy-value {
  border-radius: 2px;
  padding: 1rem;
  line-height: 1;

  &::before {
    content: '• ';
    margin-right: 5px;
  }
}
.flex-wrap {
  flex-wrap: wrap;
}

.rotate-expand-icon {
  transform: rotate(45deg);
}
.transition {
  transition: transform 0.3s ease-in-out;
}

.accordion-icon {
  background-color: inherit;
}
</style>
