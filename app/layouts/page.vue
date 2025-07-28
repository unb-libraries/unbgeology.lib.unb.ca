<template>
  <NuxtLayout name="default">
    <header class="container py-4 mx-auto flex-none sticky top-[5.5rem] z-20 bg-base dark:bg-primary-80">
      <slot name="breadcrumbs" />
      <h1 class="text-4xl">
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
