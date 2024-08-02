<template>
  <TwInputText v-model="current" class="input input-text-lg">
    <template #before>
      <div v-for="(dimensions, index) in measurements" :key="index" class="bg-accent-mid inline-flex space-x-1 text-nowrap rounded-md px-1.5 text-sm leading-6">
        {{ dimensions.map(d => `${d}cm`).join(` x `) }}
        <button class="px-1" @click.prevent.stop="onRemoveItem(index)">
          <IconCancel class="h4 fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light w-4 stroke-2" />
        </button>
      </div>
    </template>
  </TwInputText>
</template>

<script setup lang="ts">
const measurements = defineModel<[number, number, number][]>({ required: false, default: [] })

const current = ref<string>(``)
watch(current, (value) => {
  if (/^([0-9]+(\.[0-9])? *x *){2}[0-9]+(\.[0-9])?,$/.test(value)) {
    const [length, width, height] = value.slice(0, -1)?.split(`x`).map(n => n.trim())
    measurements.value = [...measurements.value, [Number(length), Number(width), Number(height)]]
    current.value = ``
  }
})

function onRemoveItem(index: number) {
  measurements.value = measurements.value.filter((_, i) => i !== index)
}

</script>
