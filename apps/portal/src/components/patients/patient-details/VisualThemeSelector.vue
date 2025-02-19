<template>
  <div>
    <p v-if="!hideLabel" class="font-weight-medium">
      Update visual theme for the patient
    </p>
    <div class="d-flex flex-column flex-sm-row justify-space-between">
      <div class="flex-container mt-4">
        <v-card
          v-for="_theme in themes"
          :key="_theme.title"
          flat
          :class="_theme.active ? 'card active' : 'card'"
        >
          <v-card-title>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h6">{{ _theme.title }}</div>
                <div class="description">{{ _theme.description }}</div>
              </div>
              <div>
                <v-switch
                  v-model="_theme.active"
                  hide-details
                  inset
                  color="success"
                  @update:model-value="
                    e => handleSwitchUpdate(e ?? false, _theme.type)
                  "
                ></v-switch>
              </div>
            </div>
          </v-card-title>
        </v-card>
      </div>
      <div class="w-100 w-sm-50 pa-3 preview-bg mt-5 mt-sm-0 ml-0 ml-sm-10">
        <v-img
          :src="
            getImage(themes.find(t => t.active)?.img ?? 'theme-classic.png')
          "
          alt="Theme image"
          cover
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Theme } from '@intake24-dietician/common/types/theme'
import { ref, watch } from 'vue'
import { VSwitch } from 'vuetify/lib/components/index.mjs'

interface ThemeRef {
  title: string
  description: string
  img: string
  active: boolean
  type: Theme
}

withDefaults(defineProps<{ modelValue: Theme; hideLabel?: boolean }>(), {
  hideLabel: false,
})
const emit = defineEmits<{
  update: [theme: Theme]
}>()

const theme = defineModel<Theme>()
const themes = ref<ThemeRef[]>([
  {
    title: 'Classic theme (default)',
    description: 'Suitable for adults',
    img: 'theme-classic.png',
    active: true,
    type: 'Classic',
  },
  {
    title: 'Child theme',
    description: 'Suitable for children and young people',
    img: 'theme-fun.png',
    active: false,
    type: 'Fun',
  },
])

type ImportedImages = Record<string, { default: string }>
const themeImages = import.meta.glob('../../../assets/dashboard/themes/*.png', {
  eager: true,
}) as ImportedImages
const getImage = (imgName: string) => {
  const path = `../../../assets/dashboard/themes/${imgName}`
  const imageModule = themeImages[path]
  if (!imageModule) {
    console.error(`Image not found: ${imgName}`)
    return ''
  }

  return imageModule.default
}

const handleSwitchUpdate = (value: boolean, theme: string) => {
  const index = themes.value.findIndex(t => t.type === theme)
  themes.value.forEach(theme => {
    if (theme.title !== themes.value[index]!.title) theme.active = !value
  })

  emit('update', themes.value.find(t => t.active)?.type ?? 'Classic')
}

watch(
  () => theme.value,
  newTheme => {
    themes.value.forEach(theme => {
      theme.active = theme.type === newTheme
    })
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.flex-container {
  display: flex;
  min-width: max(40vw, 30%);
  flex-direction: column;
  gap: 1rem;

  @media only screen and (min-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.title {
  font-size: clamp(12px, calc(0.75rem + ((1vw - 7.68px) * 0.3472)), 16px);
  min-height: 0vw;
  word-wrap: break-word; // Break long words to prevent overflow
  line-height: clamp(1.5rem, 0.231vw + 1.44rem, 1.625rem);
}

.description {
  color: #555;
  font-size: clamp(10px, calc(0.625rem + ((1vw - 7.68px) * 0.3472)), 14px);
  min-height: 0vw;
  font-weight: 400;
  line-height: 130%; /* 18.2px */
  letter-spacing: 0.14px;
}

.card {
  border-radius: 8px;
  background: #fff;
  border: 0.5px solid #f1f1f1;

  &.active {
    border: 0.5px solid #000;
  }
}

.preview-bg {
  background: #f1f1f1;
  border-radius: 8px;
}
</style>
