<template>
  <div class="relative w-full p-0" :class="wrapperClass">
    <div
      :id="id"
      :name="name"
      class="input justify-between"
      :class="classes"
      tabindex="0"
      @click.stop="optionsVisible = !optionsVisible"
    >
      <slot>
        <input
          v-if="input && !selected"
          v-model="search"
          type="text"
          class="input-ref"
          :class="itemClass"
          placeholder="Search"
          @input="$emit(`input`, search)"
        >
        <span v-else>{{ selectedLabel }}</span>
      </slot>
      <a v-if="selected" class="input-select-reset" :class="resetActionClass" @click.stop="selected = undefined">
        <slot name="reset">Reset</slot>
      </a>
    </div>
    <ul v-if="optionsVisible" class="bg-primary absolute z-[100] max-h-64 w-full overflow-y-scroll">
      <li
        v-for="[option, label] in options"
        :key="option"
        :ref="option"
        tabindex="0"
        class="input-select-item"
        :class="{ [`${selectedItemClass ?? ``} input-select-item-selected`]: selected === option }"
        @click.stop="onSelect(option)"
      >
        <slot name="item" :options="[option, label]">
          {{ label }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const selected = defineModel<string | number | object>(`selected`)
const props = defineProps<{
  options:(string | [string, string] | object)[] | Record<string, string | object>
  optionField?: string
  labelField?: string
  placeholder?: string
  input?: boolean
  filter?: (option: [string, string]) => boolean
  itemClass?: string
  selectedItemClass?: string
  wrapperClass?: string
  resetActionClass?: string
}>()
const search = ref(``)

defineEmits<{
  input: [value: string]
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
    .filter(props.filter ?? (() => true))
})

const optionsVisible = ref(false)
const selectedLabel = computed(() => (selected.value && options.value.find(([id]) => selected.value === id)?.[1]) ?? props.placeholder ?? `-- Select --`)

function onSelect(value: string) {
  selected.value = value
  optionsVisible.value = false
}
</script>
