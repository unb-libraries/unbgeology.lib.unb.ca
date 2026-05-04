<template>
  <PvInputDropdown v-model="term" :options="options" :label-field="labelField" option-field="self" />
</template>

<script setup lang="tsx" generic="T extends Term">
import { FilterOperator, type Term } from '@unb-libraries/nuxt-layer-entity'
import type { JsxElement } from 'typescript'
import { TermForm } from "#components"

const term = defineModel<string>(`term`, { required: false })
const props = defineProps<{
  type: string
  labelField?: keyof T
  addNewOption?: string | boolean
  addNewLabel?: string
  addNewForm?: JsxElement
}>()
const emits = defineEmits<{
  add: [options: { previous?: string, select:(id: keyof T) => void, selectPrevious: () => void, reset: () => void }]
}>()

const { entities: terms, add: createTerm } = await fetchEntityList<T>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, props.type]] })
const labelField = computed(() => String(props.labelField ?? `label`))
const addNewOption = computed(() => props.addNewOption !== undefined && props.addNewOption !== false ? typeof props.addNewOption === `string` ? props.addNewOption : `addNew` : false)
const addNewLabel = computed(() => props.addNewLabel ?? `+ Add new`)

const options = computed(() => {
  const termOptions = Object.fromEntries(terms.value.map(term => [term.self, term]))
  return addNewOption.value ? { ...termOptions, [addNewOption.value as string]: { self: addNewOption.value, label: addNewLabel.value } } : termOptions
})

const { setContent: setModalContent, close: closeModal } = useModal()

watch(term, (newValue, previousValue) => {
  if (newValue === addNewOption.value) {
    const select = (id: keyof T) => { term.value = String(id) }
    const selectPrevious = () => select(previousValue as keyof T)
    const reset = () => {
      term.value = undefined
    }
    emits(`add`, { previous: previousValue, select, selectPrevious, reset })
    if (addNewOption.value) {
      const Form = props.addNewForm ?? TermForm

      const onSaveTerm = async (term: T) => {
        const { entity: newTerm, error } = await createTerm({ ...term, type: props.type })
        if (!error.value && newTerm.value) {
          nextTick(() => {
            select(newTerm.value!.self)
            closeModal()
          })
        }
      }

      const onCancel = () => {
        selectPrevious()
        closeModal()
      }

      setModalContent(() => <div class={`space-y-3`}>
        <h1 class={`text-2xl`}>Add {props.type}</h1>
          <Form type={props.type} onSave={onSaveTerm} onCancel={onCancel} />
        </div>)
    }
  }
})
</script>
