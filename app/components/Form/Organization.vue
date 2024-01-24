<template>
  <EntityForm :entity="organization" @save="onSave">
    <template #default="{ body: orgBody }">
      <div class="space-y-36">
        <section class="form-col">
          <div class="form-field">
            <label for="name">Name</label>
            <PvInputText v-model="orgBody.name" class="form-input form-input-text" name="name" />
          </div>
          <div class="form-field">
            <label for="website">Website</label>
            <PvInputText v-model="orgBody.web" class="form-input form-input-text" name="website" />
          </div>
        </section>

        <section class="form-col">
          <h2 class="divider">
            Contact
          </h2>
          <div class="form-field">
            <label for="name">Name</label>
            <PvInputText v-model="orgBody.contact.name" class="form-input form-input-text" name="contact-name" />
          </div>
          <div class="form-row form-row-2">
            <div class="form-field">
              <label for="contact-email">Email</label>
              <PvInputText v-model="orgBody.contact.email" class="form-input form-input-text" name="contact-email" />
            </div>
            <div class="form-field">
              <label for="contact-phone">Phone</label>
              <PvInputText v-model="orgBody.contact.phone" class="form-input form-input-text" name="contact-phone" />
            </div>
          </div>
        </section>

        <section class="form-col">
          <h2 class="divider">
            Address
          </h2>
          <div class="form-row form-row-2">
            <div class="form-field">
              <label for="address-line1">Address line 1</label>
              <PvInputText v-model="orgBody.address.line1" class="form-input form-input-text" name="address-line1" />
            </div>
            <div class="form-field">
              <label for="address-line2">Address line 2</label>
              <PvInputText v-model="orgBody.address.line2" class="form-input form-input-text" name="address-line2" />
            </div>
          </div>
          <div class="form-row form-row-2">
            <div class="form-field">
              <label for="address-city">City</label>
              <PvInputText v-model="orgBody.address.city" class="form-input form-input-text" name="address-city" />
            </div>
            <div class="form-field">
              <label for="address-state">State / Province</label>
              <PvInputText v-model="orgBody.address.state" class="form-input form-input-text" name="address-state" />
            </div>
          </div>
          <div class="form-row form-row-2">
            <div class="form-field">
              <label for="address-postal-code">Postal code</label>
              <PvInputText v-model="orgBody.address.postalCode" class="form-input form-input-text" name="address-postal-code" />
            </div>
            <div class="form-field">
              <label for="address-country">Country</label>
              <PvInputText v-model="orgBody.address.country" class="form-input form-input-text" name="address-country" />
            </div>
          </div>
        </section>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Organization } from "types/affiliation"
import { type EntityJSONProperties, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity: EntityJSONProperties<Organization>
}>()

const emits = defineEmits<{
  save: [organization: EntityJSONBody<Organization>]
}>()

const organization = {
  address: {},
  // @ts-ignore
  contact: {},
  ...props.entity,
}

function onSave(organization: EntityJSONBody<Organization>) {
  emits(`save`, organization)
}

</script>
