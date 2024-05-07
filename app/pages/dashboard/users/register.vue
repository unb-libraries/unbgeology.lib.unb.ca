<template>
  <EntityForm :entity="user" @save="onSave" @cancel="navigateTo(returnUrl)">
    <template #default="{ body }">
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-bold" for="label">Username</label>
        <PvInputText
          id="username"
          v-model="body.username"
          name="username"
          :class="{ 'border-red dark:border-red text-red dark:text-red': errors.username }"
          autocomplete="off"
        />
        <small class="text-red">{{ errors.username || '&nbsp;' }}</small>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type EntityJSONBody, type EntityJSONProperties, type User } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
  name: `Add user`,
})

const returnUrl = `/dashboard/users`
const user = ref({} as EntityJSONProperties<User>)
const { create, fetchByPK } = useEntityType<User>(`User`)

const { validateField, errors } = useEntityValidate<User>(user)
validateField(`username`, async (username: string) => {
  if (username) {
    const { entity: user } = await fetchByPK(username)
    if (user.value) {
      return `Username already exists.`
    }
  }
})

async function onSave(user: EntityJSONBody<User>) {
  await create(user)
  navigateTo(returnUrl)
}

</script>
