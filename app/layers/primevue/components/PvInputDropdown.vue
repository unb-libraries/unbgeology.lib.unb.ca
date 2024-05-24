<template>
  <div class="relative w-full p-0" :class="wrapperClass">
    <div :id="id" :name="name" class="input justify-between" :class="classes" @click.stop="optionsVisible = !optionsVisible">
      <span>{{ selected || placeholder || `-- Select --` }}</span>
      <a v-if="selected" class="input-select-reset" :class="resetActionClass" @click.stop.prevent="selected = undefined">
        <slot name="reset">Reset</slot>
      </a>
    </div>
    <ul v-if="optionsVisible" class="bg-primary absolute z-[100] w-full">
      <li v-for="option in options" :key="option" class="input-select-item" @click.stop="onSelect(option)">
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const selected = defineModel()

defineProps<{
  options: string[]
  placeholder?: string
  itemClass?: string
  wrapperClass?: string
  resetActionClass?: string
}>()

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id, name = parentAttrs?.name, class: classList } = useAttrs() as { id: string, name: string, class: string }
const classes = computed(() => selected.value ? classList : `${classList} input-select-empty`)

const optionsVisible = ref(false)

function onSelect(value: string) {
  selected.value = value
  optionsVisible.value = false
}
</script>
