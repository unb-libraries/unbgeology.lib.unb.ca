<template>
  <EntityForm :type="[`users`, ``, useEntityType<User>]" success-url="/dashboard/users" cancel-url="/dashboard/users">
    <template #default="{ entity }">
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-bold" for="label">Username</label>
        <PvInputText :id="`username`" v-model="entity.username" name="username" />
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type User } from '~/layers/base/types/user'

definePageMeta({
  layout: `dashboard`,
})
</script>
