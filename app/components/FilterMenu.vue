<template>
  <div>
    <a id="button-filter" class="button button-md hover:button-primary-80" @click.prevent="visible = !visible">
      Filter
    </a>
    <PvContextualDropdown
      v-model="visible"
      trigger-id="button-filter"
      class="context-menu"
      @click.prevent.stop="visible = !visible"
    >
      <div class="space-y-4">
        <TwFormField v-for="{ id, label } of filters" :key="id" :label="label" :label-class="labelClass" class="w-full">
          <template #label>
            <slot :name="`${String(id)}-label`">
              {{ label }}
            </slot>
          </template>
          <slot :name="id" />
        </TwFormField>
        <div class="inline-flex items-center space-x-2">
          <button
            type="submit"
            class="button button-sm button-accent-mid hover:button-accent-light"
            @click.prevent.stop="$emit(`submit`)"
          >
            Apply
          </button>
          <a class="cursor-pointer hover:underline" @click.prevent.stop="$emit(`reset`)">Reset</a>
        </div>
      </div>
    </PvContextualDropdown>
  </div>
</template>

<script setup lang="ts" generic="T extends PropertyKey">
import type { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
type Filter = { id: T, label: string, op: FilterOperator, value: any }

const props = defineProps<{
  filters: Record<T, [FilterOperator, any] | Omit<Filter, `id` | `label`> & Pick<Partial<Filter>, `label`>>
  labelClass?: string
}>()

defineEmits<{
  submit: []
  reset: []
}>()

const filters = computed(() => Object.fromEntries(Object
  .entries<[FilterOperator, any] | Omit<Filter, `id` | `label`> & Pick<Partial<Filter>, `label`>>(props.filters).map(([key, value]) =>
    Array.isArray(value)
      ? [key, { id: key, label: String(key)[0].toUpperCase() + String(key).substring(1).toLowerCase(), op: value[0], value: value[1] }]
      : [key, { id: key, label: String(key)[0].toUpperCase() + String(key).substring(1).toLowerCase(), ...value }]) as [T, Filter][]))

const visible = ref(false)
</script>
