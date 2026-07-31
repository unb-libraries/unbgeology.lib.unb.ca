<template>
  <WithPermission :permission="/^update:specimen:/">
    <a :href="`/dashboard/specimens/${specimen.id}`" :title="`Edit ${specimen.id.toUpperCase()}`">
      <IconPen class="fill-none stroke-current hover:stroke-accent-26 dark:hover:stroke-accent-36 stroke-2 size-current" />
    </a>
  </WithPermission>
</template>

<script lang="ts" setup>
import type { Specimen } from '~~/types/specimen'

const props = defineProps<{
  specimen: Specimen
}>()
</script>