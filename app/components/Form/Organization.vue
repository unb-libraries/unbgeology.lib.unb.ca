<template>
  <EntityForm :entity="organization" @save="onSave">
    <template #default="{ body: orgBody }">
      <div class="form-field">
        <label for="name">Name</label>
        <PvInputText v-model="orgBody.name" name="name" />
      </div>

      <h3 class="form-section-heading">
        Address
      </h3>
      <div class="form-row">
        <div class="form-field">
          <label for="address-address1">Line 1</label>
          <PvInputText v-model="orgBody.address.address1" name="address-address1" />
        </div>
        <div class="form-field">
          <label for="address-address2">Line 2</label>
          <PvInputText v-model="orgBody.address.address2" name="address-address2" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label for="address-city">City</label>
          <PvInputText v-model="orgBody.address.city" name="address-city" />
        </div>
        <div class="form-field">
          <label for="address-state">State / Province</label>
          <PvInputText v-model="orgBody.address.state" name="address-state" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label for="address-postal-code">Postal code</label>
          <PvInputText v-model="orgBody.address.postalCode" name="address-postal-code" />
        </div>
        <div class="form-field">
          <label for="address-country">Country</label>
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
