<template>
  <v-card>
    <v-card-text>
      <v-container align-items="center" align="center">
        <v-row>
          <v-img width="100%" src="/clinic_welcome.svg"></v-img>
        </v-row>
        <v-row>
          <div class="text-h6 text-center">Welcome to your new clinic!</div>
        </v-row>
        <v-row class="tagline">
          Explore different functions in the clinic’s dashboard
        </v-row>
        <v-row class="description text-center">
          <p class="text-center">
            The clinic dashboard is your
            <span class="highlight">one-stop destination</span> for viewing
            patient recalls and <span class="highlight">giving feedbacks</span>,
            adding new patients,
            <span class="highlight">creating a new clinic</span> or making
            changes to an existing one.
          </p>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-col>
        <v-btn
          class="text-none"
          variant="text"
          size="small"
          width="100%"
          @click="() => emits('skip')"
          >Skip</v-btn
        >
      </v-col>
      <v-col>
        <v-btn
          class="text-none"
          variant="flat"
          size="small"
          width="100%"
          color="primary"
          @click="() => emits('next')"
          >Let's dive in!</v-btn
        >
      </v-col>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  (e: 'skip'): void
  (e: 'next'): void
}>()
</script>

<style scoped>
.description,
.tagline {
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0em;
  text-align: center;
}

.tagline {
  font-weight: 500;
}
.description {
  font-weight: 400;
}
.highlight {
  font-weight: 500;
  color: #ee672d;
}
</style>
