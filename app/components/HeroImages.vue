<template>
  <div v-for="(url, i) in urls" :key="url"
    :data-status="i === current ? 'active' : 'inactive'"
    class="absolute top-0 left-0 size-full data-[status=inactive]:opacity-0 transition-opacity ease-in duration-[1200ms] bg-no-repeat bg-bottom"
    :style="{ backgroundImage: `url(${url})` }"
  />
</template>

<script lang="ts" setup>
const current = ref(0)
const urls = [
  '/unbgeology-hero_001.png',
  '/unbgeology-hero_002.png',
  '/unbgeology-hero_003.png',
  '/unbgeology-hero_004.png',
].map(url => useImage()(url, { alt: 'UNB Earth Science Collections', height: 650, format: 'webp' }))

const duration = 8000
onMounted(() => {
  setInterval(() => {
    current.value = (current.value + 1) % urls.length
  }, duration)
})
</script>