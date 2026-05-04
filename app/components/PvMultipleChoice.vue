<template>
  <ul>
    <li v-for="option in options" :key="option[0]" :class="itemClass ?? ``">
      <PvCheckbox
        :id="option[0]"
        v-model="option[2]"
        :label="option[1]"
        :name="option"
        :class="inputClass"
        @change="(checked: boolean) => onChange(option[0], checked)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
const selected = defineModel<Record<string, boolean>>(`selected`, {
  default: {},
})

const props = defineProps<{
  itemClass?: string
  inputClass?: string
  options:(string | [string, string])[]
}>()

const normalize = (value: (string | [string, string])) => Array.isArray(value) ? value : [value, value[0].toUpperCase() + value.slice(1).toLowerCase()]
const options = computed(() => props.options.map(normalize).map<[string, string, boolean]>(([option, label]) => [option, label, Boolean(selected.value[option]) ?? false]))

const onChange = (option: string, checked: boolean) => {
  selected.value = { ...Object.fromEntries(options.value.map(([option,, checked]) => [option, checked])), [option]: checked }
}
</script>
