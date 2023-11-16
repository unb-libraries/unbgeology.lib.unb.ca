<template>
  <component :is="stack.at(-1)![0]" v-if="stack.length > 0" @stack="onStack" @unstack="onUnstack" />
</template>

<script setup lang="ts">
const props = defineProps<{
  stack?: [any, any][]
}>()

const stack = ref(props.stack ?? [])
provideContext()
provide(`unstack`, onUnstack)

onBeforeUpdate(() => {
  provideContext()
})

function provideContext() {
  provide(`context`, stack.value.at(-1)![1])
}

function onStack(component: any, context: any) {
  stack.value.push([component, context])
}

function onUnstack() {
  if (stack.value.length > 0) {
    stack.value.splice(stack.value.length - 1, 1)
  }
}
</script>
