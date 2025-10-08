<template>
  <header class="flex-none text-white dark:text-black">
    <div class="p-4 h-full md:h-fit">
      <div :class="['container mx-auto flex flex-col justify-between text-lg md:flex-row h-full', { 'gap-y-8 md:gap-y-0': !collapsed }]">
        <div class="flex flex-row justify-between">
          <a class="flex h-12" href="/" @click="collapsed = true">  
            <IconUNB class="h-full fill-current stroke-none pr-2 border-r-2 border-current" />
            <div class="text-[1.5rem] leading-6 pl-2 h-full items-between text-current">
              Earth Sciences<br>
              Collections
            </div>
          </a>
          <div class="cursor-pointer md:hidden" @click="collapsed = !collapsed">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-12"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        </div>
        <div class="flex flex-col space-y-12 md:space-y-0 h-full">
          <nav class="flex flex-col grow md:flex md:flex-row md:justify-end md:gap-x-6 divide-y divide-base-77 divide-dashed md:divide-none text-3xl md:text-xl" :class="collapsed ? 'hidden' : ''">
            <a v-if="isAuthenticated" href="/dashboard/specimens" class="py-3 md:py-0">
              Dashboard
            </a>
            <a href="/browse" class="py-3 md:py-0">
              Browse
            </a>
            <a href="/specimens" class="py-3 md:py-0">
              Search
            </a>
          </nav>
          <nav class="flex flex-col flex-none justify-end uppercase md:flex md:flex-row md:space-x-6 md:order-first text-md md:text-sm" :class="collapsed ? 'hidden' : ''">
            <a v-if="!isAuthenticated" href="/login" class="py-2 md:py-0">
              Login / Admin
            </a>
            <a v-else href="/logout" class="py-2 md:ml-2 md:py-0">
              Log out
            </a>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const collapsed = ref(true)
const { username, isAuthenticated } = useCurrentUser()
</script>
