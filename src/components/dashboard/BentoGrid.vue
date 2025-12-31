<script setup>
// Props could be added here for dynamic layouts if needed
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] p-6 w-full max-w-[1600px] mx-auto">
    <slot></slot>
  </div>
</template>

<style scoped>
/* Optional: specific bento grid adjustments */
</style>
