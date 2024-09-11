<template>
  <div class="flex h-full flex-col">
    <page-header />
    <main class="grow">
      <slot />
    </main>
    <page-footer />
  </div>
</template>

<script lang="ts" setup>
import '~/assets/css/theme.main.css'
</script>
