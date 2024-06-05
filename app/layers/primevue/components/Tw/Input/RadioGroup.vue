<template>
  <ul class="input-radio-group" :class="classList">
    <li v-for="[option, label] in options" :key="option" :class="`${(option === selected && selectedItemClass) ?? ``}${itemClass && ` ${itemClass}`}`">
      <slot name="item">
        <input
          :id="`${id}[${option}]`"
          v-bind="attrs"
          v-model="selected"
          tabindex="0"
          type="radio"
          :value="option"
          :name="`${name}[${option}]`"
          class="input-radio"
          :class="inputClass"
        >
        <label :for="`${id ?? name}[${option}]`" class="input-radio-label" :class="labelClass">
          <slot name="label" :option="option" :label="label">
            {{ label }}
          </slot>
        </label>
      </slot>
    </li>
  </ul>
</template>

<script setup lang="tsx">
defineOptions({
  inheritAttrs: false,
})

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id ?? useId(), name = parentAttrs?.name, class: classList, ...attrs } = useAttrs() as { id: string, name: string, class: string }

const selected = defineModel<string>({ required: false })
const props = defineProps<{
  options: [string, string][]
  itemClass?: string
  selectedItemClass?: string
  inputClass?: string
  labelClass?: string
}>()

const options = computed(() => props.options.map<[string, string, boolean]>(([option, label]) => [option, label, option === selected.value]))

// interface RadioOptions {

// }

// const Item = (name: string) => () => <input type="radio" v-model={selected} />
// const Items = computed(() => {
//   return props.options.map(([option, label]) => [
//     option, () => <Item name={option} />,
//   ])
// })

</script>
