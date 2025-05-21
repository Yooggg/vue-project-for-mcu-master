<template>
  <div class="card w-100">
    <div class="card-body">
      <h2 class="card-title">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String
});
</script>
