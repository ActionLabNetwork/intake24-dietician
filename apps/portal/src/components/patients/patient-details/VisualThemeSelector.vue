<template>
  <div>
    <p v-if="!hideLabel" class="font-weight-medium">
      Update visual theme for the patient
    </p>
    <div class="flex-container mt-4">
      <v-card v-for="theme in themes" :key="theme.title" class="flex-item pb-4">
        <v-img :src="getImage(theme.img)" cover></v-img>
        <v-card-title>
          <div
            class="d-flex flex-sm-row flex-column align-center justify-space-between"
          >
            <div class="title">{{ theme.title }}</div>
            <div>
              <v-switch
                v-model="theme.active"
                hide-details
                inset
                color="success"
                @update:model-value="
                  e => handleSwitchUpdate(e ?? false, theme.type)
                "
              ></v-switch>
            </div>
          </div>
        </v-card-title>
        <div class="description">{{ theme.description }}</div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Theme } from '@intake24-dietician/common/types/theme'
import { ref, watch } from 'vue'

interface ThemeRef {
  title: `${Theme} theme`
  description: string
  img: string
  active: boolean
  type: Theme
}

const props = withDefaults(
  defineProps<{ defaultState: Theme; hideLabel?: boolean }>(),
  { hideLabel: false },
)
const emit = defineEmits<{
  update: [theme: Theme]
}>()

const themes = ref<ThemeRef[]>([
  {
    title: 'Classic theme',
    description: 'Suitable for adults',
    img: 'theme_classic.png',
    active: true,
    type: 'Classic',
  },
  {
    title: 'Fun theme',
    description: 'Suitable for children and young adults',
    img: 'theme_fun.png',
    active: false,
    type: 'Fun',
  },
])

const getImage = (imgName: string) => {
  return new URL('../../../assets/dashboard/themes/' + imgName, import.meta.url)
    .href
}

const handleSwitchUpdate = (value: boolean, theme: string) => {
  const index = themes.value.findIndex(t => t.type === theme)
  themes.value.forEach(theme => {
    if (theme.title !== themes.value[index]!.title) theme.active = !value
  })

  emit('update', themes.value.find(t => t.active)?.type ?? 'Classic')
}

watch(
  () => props.defaultState,
  () => {
    themes.value.forEach(theme => {
      theme.active = theme.type === props.defaultState
    })
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.flex-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: min(40rem, 60vw);

  @media only screen and (min-width: 768px) {
    flex-direction: row;
    gap: 0;
  }
}

.flex-item {
  flex: 1;

  &:first-child {
    margin-right: 1rem;
  }
}

.title {
  font-size: clamp(1rem, 0.462vw + 0.88rem, 1.25rem);
  word-wrap: break-word; // Break long words to prevent overflow
  line-height: clamp(1.5rem, 0.231vw + 1.44rem, 1.625rem);
}

.description {
  color: #555;
  font-size: 14px;
  font-weight: 400;
  line-height: 130%; /* 18.2px */
  letter-spacing: 0.14px;
  padding: 0 1rem;
}
</style>
