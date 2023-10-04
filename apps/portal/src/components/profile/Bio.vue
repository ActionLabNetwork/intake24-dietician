<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.shortBio.title') }}
    </p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-textarea
            :label="t('profile.form.shortBio.placeholder')"
            variant="solo-filled"
          ></v-textarea>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()
</script>
