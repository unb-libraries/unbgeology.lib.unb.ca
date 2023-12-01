<template>
  <EntityForm :entity="person" @save="onSave">
    <template #default="{ body: personBody }">
      <div class="form-row">
        <div class="form-field">
          <label for="firstName">First name</label>
          <PvInputText v-model="personBody.firstName" name="firstName" />
        </div>
        <div class="form-field">
          <label for="lastName">Last name</label>
          <PvInputText v-model="personBody.lastName" name="lastName" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label for="email">Email</label>
          <PvInputText v-model="personBody.email" name="email" />
        </div>
        <div class="form-field">
          <label for="phone">Phone</label>
          <PvInputText v-model="personBody.phone" name="phone" />
        </div>
      </div>
      <div class="form-field">
        <label for="affiliations">Affiliations</label>
        <PvInputMultiSelect v-model="personBody.affiliations" :options="organizations" option-label="name" option-value="self" display="chip" />
      </div>
      <div class="form-field form-input-checkbox">
        <input v-model="personBody.public" type="checkbox" name="public">
        <label for="public">Public profile</label>
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
