<template>
  <div class="flex h-full flex-col">
    <page-header />
    <main class="flex flex-col grow overflow-y-scroll">
      <slot />
    </main>
    <page-footer />
  </div>
</template>
