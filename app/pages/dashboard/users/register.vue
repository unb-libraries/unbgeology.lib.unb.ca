<template>
  <EntityForm :entity="user" cancel-url="/dashboard/users" @created="create" @updated="update">
    <template #default="{ entity }">
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-bold" for="label">Username</label>
        <PvInputText
          id="username"
          v-model="entity.id"
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
import { type User } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const user = ref({} as User)
const { create, update, fetchByPK } = useEntityType<User>(Symbol(`users`))

const { validateField, errors } = useEntityValidate(user)
validateField(`id`, async (username: string) => {
  if (username) {
    const { entity: user } = await fetchByPK(username)
    if (user.value) {
      return `Username already exists.`
    }
  }
})

</script>
