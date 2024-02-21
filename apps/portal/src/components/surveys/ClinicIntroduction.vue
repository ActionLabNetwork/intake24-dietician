<template>
  <v-card>
    <v-card-text>
      <div>
        <div class="hero-image">
          <v-img width="100%" src="/clinic_welcome.svg"></v-img>
        </div>
        <div class="text header text-center mx-auto my-4 font-weight-bold">
          Welcome to your new clinic!
        </div>
        <p class="text subheader mx-auto mb-2 text-center">
          Explore different functions in the clinic’s dashboard
        </p>
        <div class="text description text-center">
          <p class="text-center">
            The clinic dashboard is your
            <span class="highlight">one-stop destination</span> for viewing
            patient recalls and <span class="highlight">giving feedbacks</span>,
            adding new patients,
            <span class="highlight">creating a new clinic</span> or making
            changes to an existing one.
          </p>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-col>
        <v-btn
          class="text-none"
          variant="text"
          width="100%"
          @click="() => emits('skip')"
        >
          Skip
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          class="text-none"
          variant="flat"
          width="100%"
          color="primary"
          @click="() => emits('next')"
        >
          Let's dive in!
        </v-btn>
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

<style scoped lang="scss">
.hero-image {
  border: 1px solid #f2f2f2;
  background: #f2f2f2;
  border-radius: 6px;
}

.text {
  &.header {
    color: #000;
    font-size: 24px;
    font-weight: 600;
  }
  &.subheader {
    color: #000;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
  }
  &.description {
    color: #000;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    line-height: 130%; /* 18.2px */
  }
}

.highlight {
  font-weight: 500;
  color: #ee672d;
}
</style>
