<template>
  <v-row>
    <v-col
      cols="12"
      md="12"
      class="d-flex align-center flex-wrap justify-space-between px-3 px-lg-0"
    >
      <div class="font-weight-medium">{{ label }}</div>
      <div>
        <v-btn
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
        { background: expand ? colors.backgroundColor : 'white' },
      ]"
    >
      <v-expand-transition>
        <ul v-show="expand">
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
                  {{ food.value }}{{ unitOfMeasure?.symbol }}
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
import { usePrecision } from '@vueuse/math'
import { MealCardProps } from '../types'
import { sort } from 'radash'

const props = defineProps<MealCardProps>()

const isPlusIcon = ref(true)
const isTransition = ref(true)
const expand = ref(true)

const formattedFoods = computed(() => {
  // Sort the foods in descending order of value
  const sortedFoods = sort(props.foods, food => food.value, true)
  const topContributors = sortedFoods.filter(food => food.value > 0)
  const n = 3

  // Take top n contributors
  const topNContributors = topContributors.slice(0, n).map(food => ({
    name: food.name,
    value: food.value,
    servingWeight: roundServingWeight(food.servingWeight),
  }))

  // Calculate the value and servingWeight for 'Others'
  const othersValue = topContributors
    .slice(n)
    .reduce((total, food) => total + food.value, 0)
  const othersCount =
    sortedFoods.length -
    topContributors.length +
    topContributors.slice(n).length

  return othersCount > 0
    ? [
        ...topNContributors,
        {
          name: 'Others',
          value: othersValue,
          servingWeight: `(${othersCount} foods)`,
        },
      ]
    : topNContributors
})

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

const roundServingWeight = (servingWeight: string) => {
  const rounded = usePrecision(parseFloat(servingWeight), 2)
  return rounded.value ? `(${rounded.value}g)` : ''
}

const wrapperStyle = computed(() => ({
  '--line-color': props.colors.valueCardBorderColor,
  '--bg-color': chroma(props.colors.backgroundColor)
    .darken(2)
    .saturate(4)
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
</style>
