<template>
  <SpecimenMap :specimens="specimens" :pending="pending" class="relative z-0 h-[calc(100dvh-15.5rem-2px)]" />
</template>

<script lang="ts" setup>
import { type Specimen } from '~/types/specimen'

defineProps<{
  specimens: Specimen[]
  pending?: boolean
}>()
</script>
