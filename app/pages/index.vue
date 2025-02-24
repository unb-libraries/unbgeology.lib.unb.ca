<template>
  <div class="relative size-full">
    <div class="grid h-full grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6 overflow-y-hidden">
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
      <div class="aspect-square bg-primary-60/20" />
    </div>
    <div class="absolute z-100 flex-col space-y-8 bg-primary/60 p-8 rounded-xl size-1/2 top-1/4 left-1/4 flex justify-center items-center text-base">
      <h1 class="text-4xl">UNB Earth Science Collections</h1>
      <form class="flex flex-row w-full justify-center space-x-4 space-y-0" @submit.prevent.stop="navigateTo('/specimens')">
        <input type="text" class="w-3/4 rounded-md input input-text-md">
        <button type="submit" class="button-lg button-accent-mid">Search</button>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>
