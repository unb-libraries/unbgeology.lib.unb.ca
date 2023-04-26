<template>
  <header class="flex-none">
    <div class="p-4">
      <div class="container mx-auto flex flex-col justify-between text-lg md:flex-row">
        <div class="flex flex-row justify-between">
          <NuxtLink to="/" @click="collapsed = true">
            UNB Earth Sciences Collections
          </NuxtLink>
          <div class="cursor-pointer md:hidden" @click="collapsed = !collapsed">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-12 w-12"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        </div>
        <nav class="flex flex-col md:flex md:flex-row md:items-center md:space-x-6" :class="collapsed ? 'hidden' : ''">
          <!-- Menu items here -->
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const collapsed = ref(true)
</script>
