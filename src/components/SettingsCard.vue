<template>
  <div class="card shadow-sm h-100">
    <div class="card-header bg-light">
      <h5 class="card-title mb-0">{{ title }}</h5>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String
});
</script>
<!-- 
<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}
</style> -->
