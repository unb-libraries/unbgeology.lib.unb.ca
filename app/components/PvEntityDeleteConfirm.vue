<template>
  <PvConfirm :question="`Are your sure you want to delete ${label}?`" @confirm="onConfirm" @cancel="onCancel" />
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type Entity } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  label: string
}>()

const emits = defineEmits<{
  confirm: []
  cancel: []
}>()

const onCancel = () => emits(`cancel`)
const onConfirm = () => emits(`confirm`)
</script>
