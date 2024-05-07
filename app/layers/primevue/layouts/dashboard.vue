<template>
  <div class="bg-primary flex h-screen flex-col">
    <header class="bg-primary-60/10 border-primary-40/10 mb-4 w-full flex-none border-b px-6 py-4">
      <div class="flex flex-row justify-between">
        <h1 class="text-4xl">
          Dashboard
        </h1>
        <a href="/">
          <div class="border-primary-80/40 hover:border-primary-80 inline-flex rounded-lg border px-4 py-2">
            <span>Return to site</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="ml-2 h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>
        </a>
      </div>
    </header>
    <div id="content" class="flex h-full grow overflow-y-hidden">
      <div class="flex w-full flex-row">
        <PvPane class="twa-column min-w-min list-none text-right" header-class="bg-primary-80/40 flex justify-end p-2" :collapsible="true">
          <template #header>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </template>
          <nav class="flex flex-col">
            <div v-for="group in menuRoutes.filter(({ parent }) => parent === `dashboard`)" :key="group.id" class="has-[.menu-item-active]:bg-accent-dark hover:bg-accent-dark flex flex-col">
              <NuxtLink :to="group.path" class="p-4 pl-12 text-xl uppercase" :class="{ 'bg-accent-light text-primary': $route.path.startsWith(group.path) }">
                {{ group.name }}
              </NuxtLink>
              <div v-if="$route.path.startsWith(group.path)" class="flex flex-col">
                <NuxtLink :to="group.path" class="hover:bg-accent-mid px-6 py-2" active-class="menu-item-active bg-accent-mid">
                  View all
                </NuxtLink>
                <NuxtLink v-for="route in menuRoutes.filter(({ parent }) => parent.startsWith(group.id))" :key="route.path" :to="route.path" class="hover:bg-accent-mid px-6 py-2" active-class="menu-item-active bg-accent-mid">
                  {{ route.name }}
                </NuxtLink>
              </div>
            </div>
          </nav>
        </PvPane>
        <PvPane class="twa-column grow" header-class="bg-primary-80/40 px-4 py-2 flex">
          <template #header>
            <slot name="page-title" />
          </template>
          <div class="p-6">
            <slot />
          </div>
        </PvPane>
        <PvPane class="twa-column flex-none" expanded-class="w-1/5" header-class="bg-primary-80/40 p-2" :collapsible="true">
          <template #header>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </template>
          <div class="h-full p-6">
            <slot name="sidebar">
              Nothing selected.
            </slot>
          </div>
        </PvPane>
      </div>
    </div>
    <footer class="bg-primary-60/10 border-primary-40/10 mt-4 flex w-full flex-none border-t px-6 py-4">
      <div class="flex flex-col justify-between md:flex-row">
        <div class="flex flex-col items-center md:flex-row md:space-x-4">
          <span>&copy;{{ new Date().getFullYear() }} University of New Brunswick</span>
        </div>
        <nav class="flex flex-col items-center md:flex-row md:space-x-4">
        <!-- Footer menu items here -->
        </nav>
      </div>
    </footer>

    <PvModal />
  </div>
</template>

<script setup lang="ts">
const menuRoutes = getPagesMenu()
  .filter(({ id }) => id.match(/^dashboard/))
</script>

<style scoped>
  .twa-column {
    @apply flex flex-col mx-2 first:ml-0 last:mr-0 overflow-y-scroll rounded-xl first:rounded-l-none last:rounded-r-none bg-primary-60/10 first:border-l-0 last:border-r-0 border border-primary-40/10
  }
</style>
