<template>
  <div>
    <!-- If custom brand logo is set, use it, otherwise fallback to the default logo in /public/logo.png -->
    <img :src="brand?.logo || '/logo.png'" class="h-full w-full object-cover" />
  </div>
</template>

<script setup>
// No longer importing CRMLogo since we now always render an <img> tag
const brand = defineModel()
</script>
