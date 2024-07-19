<template>
  <div class="relative w-full p-0" :class="wrapperClass">
    <div
      :id="id"
      :name="name"
      class="input"
      :class="classes"
      tabindex="0"
      @click.stop="optionsVisible = !optionsVisible"
    >
      <div class="flex grow flex-row items-center space-x-3">
        <div v-if="multi" class="inline-flex space-x-1 text-sm">
          <div v-for="[option, label] in selectedOptions" :key="option" class="text-nowrap bg-accent-mid inline-flex space-x-1 rounded-md px-1.5 text-sm leading-6">
            <span>{{ label }}</span>
            <button @click.prevent.stop="onRemoveItem(option)">
              <IconCancel class="h4 fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light w-4 stroke-2" />
            </button>
          </div>
        </div>
        <slot>
          <input
            v-if="input && (multi || selected.length < 1)"
            v-model="search"
            type="text"
            class="input-ref"
            :class="inputClass"
            :placeholder="placeholder || `Search`"
            @input="$emit(`input`, search)"
          >
          <span v-else-if="!multi && selectedOptions.length > 0">{{ selectedOptions[0][1] }}</span>
          <span v-else>{{ placeholder || `-- Select --` }}</span>
        </slot>
      </div>
      <slot name="reset">
        <a v-if="selected.length > 0" class="input-select-reset" :class="resetActionClass" @click.stop="onReset">Reset</a>
      </slot>
    </div>
    <ul v-if="optionsVisible" class="bg-primary border-primary-60/40 absolute z-[100] max-h-64 w-full overflow-y-scroll rounded-b-md border border-t-0" :class="listClass">
      <li
        v-for="[option, label] in options.filter(([id]) => !multi || !selected.includes(id))"
        :key="option"
        :ref="option"
        tabindex="0"
        class="input-select-item"
        :class="{ [`${selectedItemClass ?? ``} input-select-item-selected`]: selected[0] === option, [itemClass]: true }"
        @click.stop="onSelect(option)"
      >
        <slot name="item" :options="[option, label, selected[0] === option]">
          {{ label }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string | number | string[] | number[]>({ required: false })
const props = defineProps<{
  options:(string | [string, string] | object)[] | Record<string, string | object>
  multi?: boolean
  optionField?: string
  labelField?: string
  placeholder?: string
  input?: boolean
  inputClass?: string
  listClass?: string
  filter?: (option: [string, string]) => boolean
  itemClass?: string
  selectedItemClass?: string
  wrapperClass?: string
  resetActionClass?: string
  addNewOption?: boolean
}>()
const search = ref(``)

const emits = defineEmits<{
  input: [value: string]
  add: []
}>()

const selected = computed<string[]>({
  get: () => props.multi ? (model.value as string[] ?? []) : (model.value ? [`${model.value}`] : []),
  set: (value: string[]) => {
    model.value = props.multi ? value : value[0]
  },
})

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id, name = parentAttrs?.name, class: classList } = useAttrs() as { id: string, name: string, class: string }
const classes = computed(() => selected.value ? classList : `${classList} input-select-empty`)

const options = computed<[string, string][]>(() => {
  const arr: (string | [string, string | object] | object)[] = Array.isArray(props.options) ? props.options : Object.entries(props.options)
  const normalized = arr
    .map<[string, string | object] | object>(item => typeof item === `string` ? [item, item[0].toUpperCase() + item.toLowerCase().slice(1)] : item)
    .map<[string, string | object]>((item, index) => Array.isArray(item) ? item as [string, string | object] : [(props.optionField && item[props.optionField as keyof object]) ?? `${index}`, item])
    .map<[string, string]>(([key, value]) => (typeof value === `object` ? [key, (props.labelField && value[props.labelField as keyof object]) || value] : [key, value]) as [string, string])
    .filter(props.filter ?? (() => true))
  return props.addNewOption ? [...normalized, [`addNew`, `+ Add new`]] : normalized
})

const optionsVisible = ref(false)
const selectedOptions = computed(() => options.value.filter(([id]) => selected.value.includes(`${id}`)))

function onSelect(value: string) {
  if (value === `addNew`) {
    emits(`add`)
    optionsVisible.value = false
  } else if (props.multi) {
    selected.value = [...selected.value, value]
  } else {
    selected.value = [value]
    optionsVisible.value = false
  }
}

function onRemoveItem(value: string) {
  selected.value = selected.value.filter(id => id !== value)
}

function onReset() {
  selected.value = []
}
</script>
