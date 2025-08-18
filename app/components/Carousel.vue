<template>
  <div :data-orientation="orientation"
    :class="['group relative', { 'w-full': orientation === 'horizontal', 'h-full': orientation === 'vertical' }]"
  >
    <div ref="container"
      :class="['flex', {
        'w-full flex-row gap-x-2 overflow-x-scroll xl:overflow-x-hidden': orientation === 'horizontal',
        'h-full flex-col gap-y-2 overflow-y-scroll xl:overflow-y-hidden': orientation === 'vertical',
      }]"
      :style="{ scrollbarWidth: 'none' }"
    >
      <slot />
    </div>
    <div v-show="container && scrollPosition > 0"
      :class="[
        'absolute hidden xl:flex left-0 top-0 from-base dark:from-base-2 to-transparent items-center justify-end',
        {
          'flex-row w-fit h-full pr-12 bg-gradient-to-r': orientation === 'horizontal',
          'flex-col w-full h-fit pb-12 bg-gradient-to-b': orientation === 'vertical',
        },
      ]"
    >
      <button v-show="showNavButtons"
        type="button"
        class="invisible group-hover:visible"
        @click.stop="scrollPosition = Math.max(0, scrollPosition - container!.getBoundingClientRect()[orientation === 'horizontal' ? 'width' : 'height'] / 2)"
      >
        <IconAngleDown
          :class="[
            'fill-none hover:stroke-accent-26 dark:hover:stroke-accent-36 stroke-current stroke-1.5 size-8',
            {
              'rotate-90': orientation === 'horizontal',
              'rotate-180': orientation === 'vertical'
            }
          ]" />
      </button>
    </div>
    <div v-show="container && scrollPosition < container[orientation === 'horizontal' ? 'scrollWidth' : 'scrollHeight'] - container.getBoundingClientRect()[orientation === 'horizontal' ? 'width' : 'height']"
      :class="[
        'absolute hidden xl:flex right-0 bottom-0 from-base dark:from-base-2 to-transparent items-center justify-end',
        {
          'flex-row w-fit h-full pl-12 bg-gradient-to-l': orientation === 'horizontal',
          'flex-col w-full h-fit pt-12 bg-gradient-to-t': orientation === 'vertical',
        },
      ]"
    >
      <button v-show="showNavButtons"
        type="button"
        class="invisible group-hover:visible"
        @click.stop="scrollPosition = Math.min(container![orientation === 'horizontal' ? 'scrollWidth' : 'scrollHeight'] - container!.getBoundingClientRect()[orientation === 'horizontal' ? 'width' : 'height'], scrollPosition + container!.getBoundingClientRect()[orientation === 'horizontal' ? 'width' : 'height'] / 2)"
      >
        <IconAngleDown
          :class="[
            'fill-none hover:stroke-accent-26 dark:hover:stroke-accent-36 stroke-current stroke-1.5 size-8',
            {
              '-rotate-90': orientation === 'horizontal',
            }
          ]" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal',
})

const container = ref<HTMLDivElement>()
const showNavButtons = computed(() => {
  return container.value &&
    container.value.getBoundingClientRect()[props.orientation === 'horizontal' ? 'width' : 'height'] <
    container.value[props.orientation === 'horizontal' ? 'scrollWidth' : 'scrollHeight']
})

const scrollPosition = ref<number>(0)
watch(scrollPosition, pos => {
  if (props.orientation === 'horizontal') {
    container.value?.scrollTo({ left: pos, behavior: 'smooth' })
  } else {
    container.value?.scrollTo({ top: pos, behavior: 'smooth' })
  }
})
</script>