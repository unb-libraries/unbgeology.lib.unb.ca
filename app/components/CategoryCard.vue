<template>
  <article class="flex flex-col gap-y-6 h-full">
    <SpecimenImage
      :category="(category as 'fossil' | 'mineral' | 'rock')"
      :url="`/top-cat-images-${category}s.jpg`"
      width="525"
      height="375"
      class="flex-none w-full aspect-7/5"
    />
    <h2 class="flex-none text-2xl">{{ category.charAt(0).toUpperCase() + category.slice(1) }}s</h2>
    <div class="flex flex-col grow">
      <div v-if="category === 'fossil'" class="grow">
        <p>A fossil is the <em>preserved remains, impression, or trace of a once-living organism</em> from a past geologic age. Fossils may include body parts (bones, shells, leaves), chemical signatures, or traces (footprints, burrows).</p>
      </div>
      <div v-if="category === 'mineral'" class="grow">
        <p>A mineral is a <em>naturally occurring, inorganic solid</em> with a <em>definite chemical composition</em> and an <em>ordered atomic structure</em> (crystalline structure). Example: Quartz (SiO₂), Calcite (CaCO₃).</p>
      </div>
      <div v-if="category === 'rock'" class="grow">
        <p>A rock is a <em>naturally occurring solid aggregate of one or more minerals</em>, mineraloids, or organic matter. Rocks are classified into three main types based on their origin: Igneous, Sedimentary, Metamorphic.</p>
      </div>
      <a
        :href="`/browse/${category}s`"
        class="flex-none w-fit text-accent-26 hover:text-accent-36 dark:hover:text-accent-46 dark:text-accent-36 text-lg font-semibold underline border-none rounded-md"
      >
        Browse {{ category.charAt(0).toUpperCase() + category.slice(1) }}s
      </a>
    </div>
  </article>
</template>

<script lang="ts" setup>
defineProps<{
  category: 'fossil' | 'mineral' | 'rock'
}>()
</script>