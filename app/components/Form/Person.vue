<template>
  <EntityForm :entity="person" @save="onSave">
    <template #default="{ body: personBody }">
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="firstName">First name</label>
          <PvInputText v-model="personBody.firstName" name="firstName" />
        </div>
        <div class="ml-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="lastName">Last name</label>
          <PvInputText v-model="personBody.lastName" name="lastName" />
        </div>
      </div>
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="email">Email</label>
          <PvInputText v-model="personBody.email" name="email" />
        </div>
        <div class="ml-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="phone">Phone</label>
          <PvInputText v-model="personBody.phone" name="phone" />
        </div>
      </div>
      <div class="my-6 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="affiliations">Affiliations</label>
        <PvInputMultiSelect v-model="personBody.affiliations" :options="organizations" option-label="name" option-value="self" display="chip" />
      </div>
      <div class="my-6 flex flex-row">
        <input
          v-model="personBody.public"
          type="checkbox"
          name="public"
          class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-md border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
        >
        <label class="mx-3 align-middle" for="public">Public profile</label>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Person, type Organization } from "types/affiliation"
import { EntityJSONProperties, type EntityJSONBody } from "layers/base/types/entity"

defineProps<{
  person: EntityJSONProperties<Person>
}>()

const emits = defineEmits<{
  save: [person: EntityJSONBody<Person>]
}>()

const { list: orgList } = await fetchEntityList<Organization>(Symbol(`affiliations`), `org`)
const organizations = computed(() => orgList.value?.entities ?? [])

function onSave(person: EntityJSONBody<Person>) {
  emits(`save`, person)
}

</script>
