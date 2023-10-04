<template>
  <header class="flex-none">
    <div class="p-4">
      <div class="container mx-auto flex flex-col justify-between text-lg md:flex-row">
        <div class="flex flex-row justify-between">
          <a class="self-center" href="/" @click="collapsed = true">
            <span>UNB Earth Sciences Collections</span>
          </a>
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
        <div class="flex flex-col md:space-y-2">
          <nav class="flex flex-col items-end text-sm uppercase md:flex md:flex-row md:space-x-6" :class="collapsed ? 'hidden' : ''">
            <span v-if="currentUser">Hello {{ currentUser }}</span>
            <a v-if="currentUser" href="/specimens/create">
              Add specimen
            </a>
            <a v-if="!currentUser" href="/login" class="ml-2 py-2 md:ml-0 md:py-0">
              Login / Admin
            </a>
            <a v-else href="/logout" class="ml-2 py-2 md:ml-0 md:py-0">
              Log out
            </a>
          </nav>
          <nav class="flex flex-col md:flex md:flex-row md:justify-end md:space-x-6" :class="collapsed ? 'hidden' : ''">
            <a href="/specimens">
              Search
            </a>
            <a href="/about">
              About
            </a>
            <a href="/contact">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const collapsed = ref(true)
const currentUser = await useCurrentUser()
</script>
