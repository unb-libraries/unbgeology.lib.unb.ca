<template>
  <div class="flex h-dvh flex-col">
    <header class="p-75 flex w-full flex-none">
      <div class="space-x-100 text-125 inline-flex flex-none">
        <UNBLibrariesLogo class="h-125" />
        <div>Earth Science Collections</div>
      </div>
      <div class="space-x-100 text-75 flex grow flex-row items-center justify-end">
        <div>
          Hello Ann
        </div>
        <IconHSpace class="stroke-base-light-100 h-100 w-px fill-none stroke-1" />
        <div>Add New</div>
        <div>
          View Site
        </div>
        <div>
          Logout
        </div>
      </div>
    </header>
    <main class="flex grow flex-row overflow-y-hidden">
      <nav class="text-base-light-500 flex flex-none flex-col overflow-y-scroll">
        <NuxtLink to="/admin/dashboard" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconDashboard class="size-100 fill-base-light-500" />
          <div>Dashboard</div>
        </NuxtLink>
        <NuxtLink to="/admin/specimens" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconFossil class="size-100 stroke-base-light-500 stroke-2" />
          <div>Specimens</div>
        </NuxtLink>
        <NuxtLink to="/admin/classifications" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconShapes class="size-100 fill-base-light-500" />
          <div>Classifications</div>
        </NuxtLink>
        <NuxtLink to="/admin/collections" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconClover class="size-100 fill-base-light-500" />
          <div>Collections</div>
        </NuxtLink>
        <NuxtLink to="/admin/geochronology" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconClockArrowCCW class="size-100 fill-base-light-500" />
          <div>Geochronology</div>
        </NuxtLink>
        <NuxtLink to="/admin/loans" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconArrowsLR class="size-100 fill-base-light-500" />
          <div>Loans</div>
        </NuxtLink>
        <NuxtLink to="/admin/contributors" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconUserAndAHalf class="size-100 fill-base-light-500" />
          <div>Contributors</div>
        </NuxtLink>
        <NuxtLink to="/admin/locations" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <IconBookCheck class="size-100 fill-base-light-500" />
          <div>Storage Locations</div>
        </NuxtLink>
        <NuxtLink to="/admin/migrations" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <div class="size-100" />
          <div>Migrations</div>
        </NuxtLink>
        <NuxtLink to="/admin/users" class="p-100 pr-400 space-x-75 flex flex-row items-center">
          <div class="size-100" />
          <div>Users</div>
        </NuxtLink>
      </nav>
      <div class="bg-base-dark-300 py-lg px-xl grow">
        <slot />
      </div>
    </main>
    <footer class="p-75 flex flex-none flex-row items-center justify-between">
      <UNBLibrariesLogo
        class="h-[20px]"
        icon-class="fill-base-light-100"
        unb-class="fill-base-light-100"
        spacer-class="fill-base-light-100"
        libraries-class="fill-base-light-100"
      />
      <div class="text-base-light-100 text-75">
        Built and maintained by UNB Libraries<br>
        University of New Brunswick © {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import '~/assets/css/theme.admin.css'
</script>
