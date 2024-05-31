<template>
  <TermForm type="affiliate/organization" :entity="organization" @save="onSave">
    <template #default="{ body }">
      <TwFormField label="Website" class="w-full">
        <TwInputText v-model="body.web" class="input input-text-lg w-full" />
      </TwFormField>

      <div class="space-y-4">
        <h2 class="input-label">
          Contact
        </h2>
        <div class="bg-primary-80/40 border-primary-80 focus:border-primary-60 hover:border-primary-60 rounded-lg border p-8">
          <TwFormField label="Name" class="w-full">
            <TwInputText v-model="body.contact.name" class="input input-text-lg w-full" />
          </TwFormField>
          <div class="flex w-full flex-row space-x-4">
            <TwFormField label="Email" class="w-full">
              <TwInputText v-model="body.contact.email" class="input input-text-lg w-full" />
            </TwFormField>
            <TwFormField label="Phone" class="w-full">
              <TwInputText v-model="body.contact.phone" class="input input-text-lg w-full" />
            </TwFormField>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="input-label">
          Address
        </h2>
        <div class="bg-primary-80/40 border-primary-80 focus:border-primary-60 hover:border-primary-60 rounded-lg border p-8">
          <div class="flex w-full flex-row space-x-4">
            <TwFormField label="Address line 1" class="w-1/2">
              <TwInputText v-model="body.address.line1" class="input input-text-lg w-full" />
            </TwFormField>
            <TwFormField label="Address line 2" class="w-1/2">
              <TwInputText v-model="body.address.line2" class="input input-text-lg w-full" />
            </TwFormField>
          </div>
          <div class="flex w-full flex-row space-x-4">
            <TwFormField label="City" class="w-1/3">
              <TwInputText v-model="body.address.city" class="input input-text-lg w-full" />
            </TwFormField>
            <TwFormField label="State / Province" class="w-1/3">
              <TwInputText v-model="body.address.state" class="input input-text-lg w-full" />
            </TwFormField>
            <TwFormField label="Postal code" class="w-1/3">
              <TwInputText v-model="body.address.postalCode" class="input input-text-lg w-full" />
            </TwFormField>
          </div>
          <TwFormField label="Country" class="w-full">
            <TwInputText v-model="body.address.country" class="input input-text-lg w-full" />
          </TwFormField>
        </div>
      </div>
    </template>
  </TermForm>
</template>

<script setup lang="ts">
import { type Organization } from "types/affiliate"
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity?: Organization
}>()

const emits = defineEmits<{
  save: [organization: EntityJSONBody<Organization>]
}>()

const organization = computed(() => ({
  address: {},
  // @ts-ignore
  contact: {},
  ...(props.entity ?? {}),
}))

function onSave(organization: EntityJSONBody<Organization>) {
  emits(`save`, organization)
}

</script>
