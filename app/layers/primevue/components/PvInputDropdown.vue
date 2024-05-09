<template>
  <div class="relative w-full">
    <div class="bg-primary border-primary-60 text-primary-20 hover:border-accent-light flex h-12 cursor-pointer items-center justify-start rounded-lg border p-3" @click.stop="optionsVisible = !optionsVisible">
      {{ selected }}
    </div>
    <ul v-if="optionsVisible" class="bg-primary absolute z-[100] w-full">
      <li v-for="option in options" :key="option" class="hover:bg-accent-mid hover:text-primary flex h-8 cursor-pointer items-center justify-start p-2" @click.stop="onSelect(option)">
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  options: string[]
  modelValue: string
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  "update:modelValue": [string]
}>()

const selected = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emits(`update:modelValue`, value)
  },
})

const optionsVisible = ref(false)

function onSelect(value: string) {
  selected.value = value
  optionsVisible.value = false
}
</script>
