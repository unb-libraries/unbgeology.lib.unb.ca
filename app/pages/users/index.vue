<template>
  <section class="container mx-auto my-4 flex flex-row justify-between">
    <h1 class="text-4xl">
      Users
    </h1>
    <button class="bg-black p-3 text-white">
      <a href="/users/register">New user</a>
    </button>
  </section>
  <section class="container mx-auto">
    <PvTable v-if="data?.items && data.items.length" :value="data.items">
      <PvTableColumn field="username" header="Username" />
      <PvTableColumn field="profile.firstName" header="First Name" />
      <PvTableColumn field="profile.lastName" header="Last Name" />
      <PvTableColumn field="profile.email" header="Email" />
      <PvTableColumn field="profile.phone" header="Phone" />
      <PvTableColumn field="active" header="Status">
        <template #body="slotProps">
          <span v-if="slotProps.data.active" class="text-green-600">Active</span>
          <span v-else class="text-red-600">Inactive</span>
        </template>
      </PvTableColumn>
      <PvTableColumn>
        <template #body="slotProps">
          <button class="bg-black p-2 text-sm text-white" @click="toggleStatus(slotProps.data.username, slotProps.data.active)">
            {{ slotProps.data.active ? 'Deactivate' : 'Activate' }}
          </button>
        </template>
      </PvTableColumn>
    </PvTable>
    <p v-else>
      No users have been added yet.
    </p>
  </section>
</template>

<script setup lang="ts">
import { type User } from "entity-types/User"

definePageMeta({
  auth: {
    public: false,
    redirect: true,
  },
})

const toggleStatus = async function (username: string, active: boolean) {
  const { error } = await useFetch(`/api/users/${username}`, {
    method: `PUT`,
    body: {
      active: !active,
    },
  })

  if (!error.value) {
    refresh()
  }
}

const { data, refresh } = await useFetch<{ items: User[] }>(`/api/users`)

</script>
