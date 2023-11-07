<template>
  <EntityForm :entity="organization" @save="onSave">
    <template #default="{ body: orgBody }">
      <div class="mb-6 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="name">Name</label>
        <PvInputText v-model="orgBody.name" name="name" />
      </div>

      <h3 class="text-primary-80 border-primary-80 mb-3 mt-12 w-full border-b py-2 text-sm uppercase">
        Address
      </h3>
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="address-address1">Line 1</label>
          <PvInputText v-model="orgBody.address.address1" name="address-address1" />
        </div>
        <div class="ml-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="address-address2">Line 2</label>
          <PvInputText v-model="orgBody.address.address2" name="address-address2" />
        </div>
      </div>
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="address-city">City</label>
          <PvInputText v-model="orgBody.address.city" name="address-city" />
        </div>
        <div class="ml-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="address-state">State / Province</label>
          <PvInputText v-model="orgBody.address.state" name="address-state" />
        </div>
      </div>
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="address-postal-code">Postal code</label>
          <PvInputText v-model="orgBody.address.postalCode" name="address-postal-code" />
        </div>
        <div class="ml-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="address-country">Country</label>
          <PvInputText v-model="orgBody.address.country" name="address-country" />
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Organization } from "types/affiliation"
import { EntityJSONProperties, type EntityJSONBody } from "layers/base/types/entity"

defineProps<{
  organization: EntityJSONProperties<Organization>
}>()

const emits = defineEmits<{
  save: [organization: EntityJSONBody<Organization>]
}>()

function onSave(organization: EntityJSONBody<Organization>) {
  emits(`save`, organization)
}

</script>
