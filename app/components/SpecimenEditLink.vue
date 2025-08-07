<template>
  <a v-if="hasPermission(/^update:specimen:/)"
    :href="`/dashboard/specimens/${specimen.id}`"
    :title="`Edit ${specimen.id.toUpperCase()}`"
  >
    <IconPen class="fill-none stroke-current hover:stroke-accent-26 stroke-2 size-current" />
  </a>
</template>

<script lang="ts" setup>
import type { Specimen } from '~/types/specimen'

defineProps<{
  specimen: Specimen
}>()
const { hasPermission } = useCurrentUser()
</script>