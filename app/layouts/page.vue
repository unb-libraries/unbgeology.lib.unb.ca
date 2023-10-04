<template>
  <NuxtLayout name="default">
    <header class="container mx-auto">
      <h1 class="my-8 text-4xl">
        <slot name="title">
          {{ name }}
        </slot>
      </h1>
    </header>
    <div id="content" class="container mx-auto mb-16 mt-4">
      <slot />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { name } = useRoute()
</script>
