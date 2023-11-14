<template>
  <Teleport to="body">
    <div class="bg-primary-60/75 fixed left-0 top-0 z-[10000] h-screen w-screen">
      <div class="bg-primary absolute left-1/4 top-1/4 w-1/2 rounded-lg p-8">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
