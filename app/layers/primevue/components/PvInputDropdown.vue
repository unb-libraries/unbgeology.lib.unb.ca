<template>
  <div class="relative w-full p-0" :class="wrapperClass">
    <div :id="id" :name="name" class="input justify-between" :class="classes" @click.stop="optionsVisible = !optionsVisible">
      <span>{{ selectedLabel }}</span>
      <a v-if="selected" class="input-select-reset" :class="resetActionClass" @click.stop.prevent="selected = undefined">
        <slot name="reset">Reset</slot>
      </a>
    </div>
    <ul v-if="optionsVisible" class="bg-primary absolute z-[100] w-full">
      <li v-for="[option, label] in options" :key="option" class="input-select-item" @click.stop="onSelect(option)">
        {{ label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const selected = defineModel<string | number | object>()
const props = defineProps<{
  options:(string | [string, string] | object)[] | Record<string, string | object>
  optionField?: string
  labelField?: string
  placeholder?: string
  itemClass?: string
  wrapperClass?: string
  resetActionClass?: string
}>()

if (typeof selected.value === `object`) {
  if (props.optionField && props.optionField in selected.value) {
    selected.value = selected.value[props.optionField]
  } else {
    selected.value = undefined
  }
}

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id, name = parentAttrs?.name, class: classList } = useAttrs() as { id: string, name: string, class: string }
const classes = computed(() => selected.value ? classList : `${classList} input-select-empty`)

const options = computed(() => {
  const arr: (string | [string, string | object] | object)[] = Array.isArray(props.options) ? props.options : Object.entries(props.options)
  return arr
    .map<[string, string | object] | object>(item => typeof item === `string` ? [item, item[0].toUpperCase() + item.toLowerCase().slice(1)] : item)
    .map<[string, string | object]>((item, index) => Array.isArray(item)
      ? item
      : typeof item === `object`
        ? [(props.optionField && item[props.optionField]) ?? `${index}`, item]
        : item)
    .map<[string, string]>(([key, value]) => typeof value === `object` ? [key, props.labelField && props.labelField in value ? value[props.labelField] : value] : [key, value])
})

const optionsVisible = ref(false)
const selectedLabel = computed(() => (selected.value && options.value.find(([id]) => selected.value === id)?.[1]) ?? props.placeholder ?? `-- Select --`)

function onSelect(value: string) {
  selected.value = value
  optionsVisible.value = false
}
</script>
