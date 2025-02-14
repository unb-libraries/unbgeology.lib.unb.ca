<template>
  <NuxtLayout name="default">
    <header class="container mx-auto flex-none">
      <h1 class="my-4 text-4xl">
        <slot name="title">
          {{ name }}
        </slot>
      </h1>
    </header>
    <div id="content" class="container grow overflow-y-hidden mx-auto mb-8 mt-4">
      <slot />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { name } = useRoute()
</script>
