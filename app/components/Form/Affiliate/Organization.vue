<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Name">
      <TwInputText v-model="label" class="input input-text-lg w-full" />
    </TwFormField>

    <div class="space-y-4">
      <h2 class="input-label">
        Contact
      </h2>
      <div class="bg-primary-80/40 border-primary-80 focus:border-primary-60 hover:border-primary-60 rounded-lg border p-8">
        <TwFormField label="Name" class="w-full">
          <TwInputText v-model="contact.name" class="input input-text-lg w-full" />
        </TwFormField>
        <div class="flex w-full flex-row space-x-4">
          <TwFormField label="Email" class="w-full">
            <TwInputText v-model="contact.email" class="input input-text-lg w-full" />
          </TwFormField>
          <TwFormField label="Phone" class="w-full">
            <TwInputText v-model="contact.phone" class="input input-text-lg w-full" />
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
            <TwInputText v-model="address.line1" class="input input-text-lg w-full" />
          </TwFormField>
          <TwFormField label="Address line 2" class="w-1/2">
            <TwInputText v-model="address.line2" class="input input-text-lg w-full" />
          </TwFormField>
        </div>
        <div class="flex w-full flex-row space-x-4">
          <TwFormField label="City" class="w-1/3">
            <TwInputText v-model="address.city" class="input input-text-lg w-full" />
          </TwFormField>
          <TwFormField label="State / Province" class="w-1/3">
            <TwInputText v-model="address.state" class="input input-text-lg w-full" />
          </TwFormField>
          <TwFormField label="Postal code" class="w-1/3">
            <TwInputText v-model="address.postalCode" class="input input-text-lg w-full" />
          </TwFormField>
        </div>
        <TwFormField label="Country" class="w-full">
          <TwInputText v-model="address.country" class="input input-text-lg w-full" />
        </TwFormField>
      </div>

      <TwFormField label="Website" class="w-full">
        <TwInputText v-model="web" class="input input-text-lg w-full" />
      </TwFormField>
    </div>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Organization } from "types/affiliate"

const props = defineProps<{
  organization?: Organization
}>()

const emits = defineEmits<{
  save: [organization: Organization]
  cancel: []
}>()

const label = ref(props.organization?.label)
const address = reactive({
  line1: props.organization?.address?.line1,
  line2: props.organization?.address?.line2,
  city: props.organization?.address?.city,
  state: props.organization?.address?.state,
  postalCode: props.organization?.address?.postalCode,
  country: props.organization?.address?.country,
})
const contact = reactive({
  name: props.organization?.contact?.name,
  email: props.organization?.contact?.email,
  phone: props.organization?.contact?.phone,
})
const web = ref(props.organization?.web?.[0])

function onSave() {
  emits(`save`, {
    label: label.value,
    address: (Object.values(address).some(v => v) && {
      line1: address.line1 || (props.organization?.address?.line1 ? null : undefined),
      line2: address.line2 || (props.organization?.address?.line2 ? null : undefined),
      city: address.city || (props.organization?.address?.city ? null : undefined),
      state: address.state || (props.organization?.address?.state ? null : undefined),
      postalCode: address.postalCode || (props.organization?.address?.postalCode ? null : undefined),
      country: address.country || (props.organization?.address?.country ? null : undefined),
    }) || (Object.values(props.organization?.address ?? {}).some(v => v) ? null : undefined),
    contact: (Object.values(contact).some(v => v) && {
      name: contact.name || (props.organization?.contact?.name ? null : undefined),
      email: contact.email || (props.organization?.contact?.email ? null : undefined),
      phone: contact.phone || (props.organization?.contact?.phone ? null : undefined),
    }) || (Object.values(props.organization?.contact ?? {}).some(v => v) ? null : undefined),
    web: web.value ? [web.value] : [],
  })
}

</script>
