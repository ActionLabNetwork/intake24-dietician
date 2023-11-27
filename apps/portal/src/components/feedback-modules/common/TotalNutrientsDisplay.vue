<template>
  <div class="mt-6 total-container">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.total-container {
  border-radius: 4px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: #f1f1f1;
  padding: 1rem;
  font-weight: 500;
}
</style>
