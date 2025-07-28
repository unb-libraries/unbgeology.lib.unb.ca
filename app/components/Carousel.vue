<template>
  <div class="group w-full relative">
    <div ref="container" class="w-full flex gap-x-2 overflow-x-scroll xl:overflow-x-hidden">
      <slot />
    </div>
    <div v-show="scrollPosition > 0" class="absolute hidden xl:flex left-0 top-0 w-fit h-full pr-12 bg-gradient-to-r from-primary-80 to-transparent items-center justify-end">
      <button v-show="showNavButtons"
        type="button"
        class="invisible group-hover:visible"
        @click.stop="onScroll(-150)"
      >
        <IconAngleDown class="fill-none hover:stroke-accent-light stroke-current stroke-1.5 size-8 rotate-90" />
      </button>
    </div>
    <div v-show="container && scrollPosition < container.scrollWidth" class="absolute hidden xl:flex right-0 top-0 w-fit h-full pl-12 bg-gradient-to-l from-primary-80 to-transparent items-center justify-end">
      <button v-show="showNavButtons"
        type="button"
        class="invisible group-hover:visible"
        @click.stop="onScroll(150)"
      >
        <IconAngleDown class="fill-none hover:stroke-accent-light stroke-current stroke-1.5 size-8 -rotate-90" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const container = ref<HTMLDivElement>()
const scrollPosition = ref<number>(0)
const showNavButtons = computed(() => {
  return container.value && container.value!.getBoundingClientRect().width < container.value!.scrollWidth
})

function onScroll(left: number) {
  container.value?.scrollBy({ left, behavior: 'smooth' })
  scrollPosition.value = container.value?.scrollLeft ?? 0
}
</script>