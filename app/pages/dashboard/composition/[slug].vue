<template>
  <TermForm :entity="term!" :type="`composition/${type}`" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import { Status, type Composition, type CompositionCreateBody } from "~~/types/composition"

const { slug } = useRoute().params
const { type = 'fossil' } = useRoute().query

definePageMeta({
  name: `Edit Composition`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:composition)?/,
  },
  menu: {
    weight: 0,
  },
})

const { hasPermission } = useCurrentUser()
const { fetchBy } = useEntityType<Composition, CompositionCreateBody, Partial<CompositionCreateBody>>(`Term`)
const { entity: term, update } = await fetchBy({ type: `composition/${type}`, slug: slug as string })
if (!term.value) {
  showError(`Term not found`)
}
if (!hasPermission(new RegExp(`^update:term(:composition(:${type})?)?(:${useEnum(Status).labelOf(term.value!.status)})?:(\\*|\\w)$`))) {
  showError({ statusCode: 403, statusMessage: `You do not have permission to edit this composition term.` })
}

const returnUrl = `/dashboard/composition`

async function onSave({ label }: Partial<CompositionCreateBody>) {
  await update({ label })
  navigateTo(returnUrl)
}

</script>
