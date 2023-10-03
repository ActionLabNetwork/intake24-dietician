<template>
  <div>
    <p class="font-weight-medium">Short bio - about yourself</p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-textarea
            label="Write something about yourself..."
            variant="solo-filled"
          ></v-textarea>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
</script>
