<template>
  <ul>
    <li v-for="option in options" :key="option[0]" :class="itemClass ?? ``">
      <PvCheckbox
        :id="option[0]"
        v-model="option[2]"
        :label="option[1]"
        :name="option[0]"
        :class="inputClass ?? ``"
        @change="(checked: boolean) => onChange(checked, option)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  itemClass?: string
  inputClass?: string
  options:(string | [string, string])[]
  modelValue: string[]
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [string[]]
}>()

const options = computed<[string, string, boolean][]>({
  get() {
    return props.options
      .map(option => Array.isArray(option) ? option : [option, option])
      .map(([value, label]) => [value, label.charAt(0).toUpperCase() + label.slice(1)])
      .map(([value, label]) => [value, label, props.modelValue.includes(value)])
  },
  set(value: [string, string, boolean][]) {
    emits(`update:modelValue`, value
      .filter(([, , checked]) => checked === true)
      .map(([value]) => value))
  },
})

const onChange = (checked: boolean, option: [string, string, boolean]) => {
  // explcitly set the value to a new array to trigger the setter
  options.value = options.value.map(opt => opt !== option ? opt : [option[0], option[1], checked])
}
</script>
