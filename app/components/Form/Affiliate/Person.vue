<template>
  <EntityForm :entity="person" @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Pronouns" class="w-1/5">
      <PvInputDropdown v-model="pronouns" :options="[[Pronouns.HE, `He/Him`],[Pronouns.SHE, `She/Her`],[Pronouns.THEY, `They/Them`]]" class="input-select-lg w-full" />
    </TwFormField>

    <div class="flex flex-row space-x-4">
      <TwFormField label="Title" class="w-1/5">
        <PvInputDropdown v-model="title" :options="[[Title.DR, `Dr.`],[Title.PROF, `Prof.`],[Title.DR | Title.PROF, `Prof. Dr.`]]" class="input-select-lg w-full" />
      </TwFormField>
      <TwFormField label="First name" class="w-2/5">
        <TwInputText v-model="firstName" class="input input-text-lg w-full" />
      </TwFormField>
      <TwFormField label="Last name" class="w-2/5">
        <TwInputText v-model="lastName" class="input input-text-lg w-full" />
      </TwFormField>
    </div>

    <div class="flex flex-row space-x-4">
      <TwFormField label="Occupation" class="w-1/2">
        <TwInputText v-model="occupation" class="input input-text-lg w-full" />
      </TwFormField>
      <TwFormField label="Position" class="w-1/2">
        <TwInputText v-model="position" class="input input-text-lg w-full" />
      </TwFormField>
    </div>

    <TwFormField label="Bio" class="w-full">
      <TwInputTextArea v-model="bio" class="input input-textarea-lg w-full" />
    </TwFormField>

    <div class="flex flex-row space-x-4">
      <TwFormField label="Email" class="w-1/2">
        <TwInputText v-model="email" class="input input-text-lg w-full" />
      </TwFormField>
      <TwFormField label="Phone" class="w-1/2">
        <TwInputText v-model="phone" class="input input-text-lg w-full" />
      </TwFormField>
    </div>

    <TwFormField label="Website" class="w-full">
      <TwInputText v-model="web" class="input input-text-lg w-full" />
    </TwFormField>

    <PvCheckbox v-model="active" label="Active" />
  </EntityForm>
</template>

<script setup lang="ts">
import { type Person, Pronouns, Title } from "types/affiliate"

const props = defineProps<{
  person?: Person
}>()

const emits = defineEmits<{
  save: [person: Person]
  cancel: []
}>()

const firstName = ref(props.person?.firstName)
const lastName = ref(props.person?.lastName)
const title = ref((props.person?.title && useEnum(Title).valueOf(props.person?.title)) || undefined)
const pronouns = ref((props.person?.pronouns && useEnum(Pronouns).valueOf(props.person?.pronouns)) || undefined)
const occupation = ref(props.person?.occupation)
const position = ref(props.person?.position)
const bio = ref(props.person?.bio)
const email = ref(props.person?.email)
const phone = ref(props.person?.phone)
const web = ref(props.person?.web?.[0])
const active = ref(props.person?.active ?? false)

function onSave() {
  emits(`save`, {
    label: [firstName.value?.trim() ?? ``, lastName.value?.trim() ?? ``].join(` `),
    firstName: (firstName.value && firstName.value.trim()) || (props.person?.firstName ? null : undefined),
    lastName: (lastName.value && lastName.value.trim()) || (props.person?.lastName ? null : undefined),
    title: (title.value && title.value) || (props.person?.title ? null : undefined),
    pronouns: (pronouns.value && pronouns.value) || (props.person?.pronouns ? null : undefined),
    occupation: (occupation.value && occupation.value.trim()) || (props.person?.occupation ? null : undefined),
    position: (position.value && position.value.trim()) || (props.person?.position ? null : undefined),
    bio: (bio.value && bio.value.trim()) || (props.person?.bio ? null : undefined),
    email: (email.value && email.value.trim()) || (props.person?.email ? null : undefined),
    phone: (phone.value && phone.value.trim().replace(/[^\d+]/g, ``)) || (props.person?.phone ? null : undefined),
    web: web.value ? [web.value] : (props.person?.web?.length ? null : undefined),
    active: active.value,
  })
}

</script>
