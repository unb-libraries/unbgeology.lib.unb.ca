<template>
  <form class="form-col" @submit.prevent="submit()">
    <slot :body="entityBody" />
    <div class="form-actions">
      <slot name="actions" :body="entityBody">
        <button type="submit" class="button button-lg button-accent-mid hover:button-accent-light disabled:button-primary-60 disabled:text-primary-20 flex-none disabled:cursor-not-allowed" :disabled="!isValid">
          Save
        </button>
        <slot name="more-actions" :body="entityBody" />
      </slot>
      <span class="button button-lg button-transparent grow-0 hover:underline" @click.prevent="emits(`cancel`)">
        Cancel
      </span>
    </div>
  </form>
</template>

<script setup lang="ts" generic="T extends object">
const props = defineProps<{
  entity?: T
}>()

const emits = defineEmits<{
  save: [entity: T],
  cancel: [],
}>()

const entityBody = reactive<T>(props.entity ?? {} as T)

const validationErrors = ref<Record<string, string>>({})
provide(`setError`, function (id: string, error: string) { validationErrors.value[id] = error })
provide(`unsetError`, function (id: string) { delete validationErrors.value[id] })
const isValid = computed(() => Object.values(validationErrors.value).length === 0)

const submit = function () {
  emits(`save`, toRaw(entityBody) as T)
}
</script>
