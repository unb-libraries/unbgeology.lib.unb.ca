<template>
  <form class="form-col" @submit.prevent="submit()">
    <slot :body="entityBody" />
    <div class="form-actions">
      <slot name="actions" :body="entityBody">
        <button type="submit" class="button button-lg button-accent-mid hover:button-accent-light disabled:button-primary-60 disabled:text-primary-20 flex-none disabled:cursor-not-allowed" :disabled="!isValid">
          {{ submitLabel ?? `Save` }}
          <IconSpinner v-if="status === `saving`" class="ml-2 inline size-5 animate-spin fill-none stroke-current stroke-2" />
          <IconCheck v-else-if="status === `saved`" class="ml-2 inline size-5 fill-none stroke-current stroke-2" />
        </button>
        <slot name="more-actions" :body="entityBody" />
      </slot>
      <span class="button button-lg button-transparent grow-0 hover:underline" @click.prevent="emits(`cancel`)">
        {{ cancelLabel ?? `Cancel` }}
      </span>
    </div>
  </form>
</template>

<script setup lang="ts" generic="E extends Entity, I extends Partial<Omit<E, keyof Entity>>">
import type { Entity } from '@unb-libraries/nuxt-layer-entity'

const props = defineProps<{
  entity?: I
  submitLabel?: string
  cancelLabel?: string
  status?: `idle` | `saving` | `saved`
}>()

const emits = defineEmits<{
  save: [entity: E],
  cancel: [],
}>()

const entityBody = reactive<I>(props.entity ?? {} as I)

const validationErrors = ref<Record<string, string>>({})
provide(`setError`, function (id: string, error: string) { validationErrors.value[id] = error })
provide(`unsetError`, function (id: string) { delete validationErrors.value[id] })
const isValid = computed(() => Object.values(validationErrors.value).length === 0)

const submit = function () {
  emits(`save`, entityBody as E)
}
</script>
