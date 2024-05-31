<template>
  <EntityForm :entity="person" @save="onSave">
    <template #default="{ body }">
      <TwFormField label="Pronouns" class="w-1/5">
        <PvInputDropdown v-model="body.pronouns" :options="pronouns" class="input-select-lg w-full" />
      </TwFormField>

      <div class="flex flex-row space-x-4">
        <TwFormField label="Title" class="w-1/5">
          <PvInputDropdown v-model="body.title" :options="titles" class="input-select-lg w-full" />
        </TwFormField>
        <TwFormField label="First name" class="w-2/5">
          <TwInputText v-model="body.firstName" class="input input-text-lg w-full" />
        </TwFormField>
        <TwFormField label="Last name" class="w-2/5">
          <TwInputText v-model="body.lastName" class="input input-text-lg w-full" />
        </TwFormField>
      </div>

      <div class="flex flex-row space-x-4">
        <TwFormField label="Occupation" class="w-1/2">
          <TwInputText v-model="body.occupation" class="input input-text-lg w-full" />
        </TwFormField>
        <TwFormField label="Position" class="w-1/2">
          <TwInputText v-model="body.position" class="input input-text-lg w-full" />
        </TwFormField>
      </div>

      <TwFormField label="Bio" class="w-full">
        <TwInputTextArea v-model="body.bio" class="input input-textarea-lg w-full" />
      </TwFormField>

      <div class="flex flex-row space-x-4">
        <TwFormField label="Email" class="w-1/2">
          <TwInputText v-model="body.email" class="input input-text-lg w-full" />
        </TwFormField>
        <TwFormField label="Phone" class="w-1/2">
          <TwInputText v-model="body.phone" class="input input-text-lg w-full" />
        </TwFormField>
      </div>

      <TwFormField label="Website" class="w-full">
        <TwInputText v-model="body.web" class="input input-text-lg w-full" />
      </TwFormField>

      <PvCheckbox v-model="body.active" label="Active" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Person, Pronouns, Title } from "types/affiliate"

const props = defineProps<{
  person?: Person
}>()

const pronouns = [
  [Pronouns.HE, `He/Him`],
  [Pronouns.SHE, `She/Her`],
  [Pronouns.THEY, `They/Them`],
]

const titles = [
  [Title.DR, `Dr.`],
  [Title.PROF, `Prof.`],
  [Title.DR | Title.PROF, `Prof. Dr.`],
]

const emits = defineEmits<{
  save: [person: Person]
}>()

const person = reactive({
  ...(props.person ?? {}),
  pronouns: (props.person?.pronouns && useEnum(Pronouns).valueOf(props.person?.pronouns)) || undefined,
  title: (props.person?.title && useEnum(Title).valueOf(props.person?.title)) || undefined,
  web: props.person?.web?.[0],
})

function onSave({ web, ...person }: Person) {
  emits(`save`, {
    ...person,
    label: `${person.firstName} ${person.lastName}`,
    type: `affiliate/person`,
    web: web ? [web] : [],
  })
}

</script>
