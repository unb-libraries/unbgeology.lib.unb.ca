<template>
  <NuxtLayout name="default">
    <header class="container mx-auto flex-none sticky top-[5.5rem] z-20 bg-base dark:bg-primary-80">
      <h1 class="my-4 text-4xl">
        <slot name="title">
          {{ name }}
        </slot>
      </h1>
    </header>
    <div id="content" class="container mx-auto mb-8">
      <slot />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { name } = useRoute()
</script>
