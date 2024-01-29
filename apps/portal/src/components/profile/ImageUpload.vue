<template>
  <div class="d-flex flex-column">
    <v-avatar size="100%" rounded="0" class="avatar mx-auto">
      <v-img :src="avatarImage" alt="Avatar" height="100%" width="100%" />
    </v-avatar>
    <v-btn
      class="mt-5 text-center font-weight-medium text-capitalize"
      flat
      @click="
        () => {
          imageUpload.click()
        }
      "
    >
      {{ t('profile.form.personalDetails.uploadImage') }}
    </v-btn>
    <input
      ref="imageUpload"
      type="file"
      accept="image/*"
      hidden
      @change="handleImageUpload"
    />
  </div>
</template>
<script setup lang="ts">
import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { avatarSchema } from '@intake24-dietician/portal/schema/profile'
import { validateWithZod } from '@intake24-dietician/portal/validators'

const props = defineProps<{
  defaultState: string
}>()
const emit = defineEmits<{
  update: [value: string]
}>()

const { t } = useI18n<i18nOptions>()

const $toast = useToast()
const imageUpload = ref()
const avatarImage = ref('')

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref(props.defaultState)

onMounted(() => {
  avatarImage.value = props.defaultState
})

const handleImageUpload = () => {
  const file = imageUpload.value.files[0]
  if (!file) return

  const validationResult = validateWithZod(avatarSchema, file.size)
  if (typeof validationResult === 'string') {
    $toast.error(validationResult)
    return
  }

  const objectURL = URL.createObjectURL(file)
  avatarImage.value = objectURL

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = () => {
    const base64data = reader.result
    formValues.value = base64data?.toString() ?? ''
    emit('update', formValues.value)

    URL.revokeObjectURL(objectURL)
  }
}
</script>
