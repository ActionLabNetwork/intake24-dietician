<template>
  <div>
    <p class="font-weight-medium">Update visual theme for the patient</p>
    <div class="flex-container mt-4">
      <v-card v-for="theme in themes" :key="theme.title" class="flex-item pb-4">
        <v-img :src="getImage(theme.img)" cover></v-img>
        <v-card-title>
          <div class="d-flex align-center justify-space-between">
            <div>{{ theme.title }}</div>
            <div>
              <v-switch
                v-model="theme.active"
                hide-details
                inset
                color="success"
                @update:model-value="
                  e => handleSwitchUpdate(e ?? false, theme.title)
                "
              ></v-switch>
            </div>
          </div>
        </v-card-title>
        <v-card-subtitle>{{ theme.description }}</v-card-subtitle>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  update: [value: boolean, theme: string]
}>()

const themes = ref([
  {
    title: 'Classic theme',
    description: 'Suitable for adults',
    img: 'theme_classic.png',
    active: true,
  },
  {
    title: 'Fun theme',
    description: 'Suitable for children and young adults',
    img: 'theme_fun.png',
    active: false,
  },
])

const getImage = (imgName: string) => {
  return new URL('../../../assets/dashboard/themes/' + imgName, import.meta.url)
    .href
}

const handleSwitchUpdate = (value: boolean, theme: string) => {
  const index = themes.value.findIndex(t => t.title === theme)
  themes.value.forEach(theme => {
    if (theme.title !== themes.value[index]!.title) theme.active = !value
  })
  emit('update', value, theme)
}
</script>

<style scoped lang="scss">
.flex-container {
  display: flex;
}

.flex-item {
  flex: 1;
  max-width: 25%;
  margin-right: 1rem;
}
</style>
