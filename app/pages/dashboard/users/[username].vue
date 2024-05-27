<template>
  <UserForm :user="user!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { User, EntityJSONCreateBody } from '@unb-libraries/nuxt-layer-entity'

const { username } = useRoute().params
definePageMeta({
  layout: `dashboard-page`,
  name: `Edit user`,
  auth: {
    permission: /^update:user/,
  },
})

const { update, fetchByPK } = useEntityType<User>(`User`)
const { entity: user } = await fetchByPK(username as string, { select: [`id`, `roles`, `active`] })
if (!user) {
  showError({ statusCode: 404, statusMessage: `User not found.` })
}

async function onSave(user: EntityJSONCreateBody<User>) {
  await update(user)
  navigateTo(returnUrl)
}

const returnUrl = `/dashboard/users`
</script>
