<template>
  <UserForm @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import { type User, type EntityJSONCreateBody } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard-page`,
  name: `Add user`,
  auth: {
    permission: /^create:user/,
  },
})

const { create } = useEntityType<User>(`User`)
async function onSave(user: EntityJSONCreateBody<User>) {
  await create(user)
  navigateTo(returnUrl)
}
const returnUrl = `/dashboard/users`

</script>
