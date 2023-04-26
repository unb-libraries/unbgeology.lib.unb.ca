<template>
  <div class="flex h-full flex-col">
    <page-header class="bg-gray-300" />
    <main class="grow">
      <slot />
    </main>
    <page-footer class="bg-gray-200" />
  </div>
</template>
