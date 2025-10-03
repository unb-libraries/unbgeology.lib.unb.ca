<template>
  <nuxt-img v-for="(url, i) in urls" :key="url"
    :src="url"
    alt="UNB Earth Science Collections"
    :sizes="sizes"
    format="webp"
    :data-status="i === current ? 'active' : 'inactive'"
    class="absolute top-0 left-0 w-full data-[status=inactive]:opacity-0 transition-opacity ease-in duration-[1200ms]"
  />
</template>

<script lang="ts" setup>

defineProps<{
  sizes?: string
}>()

const current = ref(0)
const urls = [
  '/unbgeology-hero_001.png',
  '/unbgeology-hero_002.png',
  '/unbgeology-hero_003.png',
  '/unbgeology-hero_004.png',
]

const duration = 8000
onMounted(() => {
  setInterval(() => {
    current.value = (current.value + 1) % urls.length
  }, duration)
})
</script>