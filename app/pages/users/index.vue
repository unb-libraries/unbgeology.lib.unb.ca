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
    <PvTable v-if="users && users.length" :value="users">
      <PvColumn field="username" header="Username" />
      <PvColumn field="email" header="Email" />
    </PvTable>
    <p v-else>
      No users have been added yet.
    </p>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    public: false,
    redirect: true,
  },
})

const { data: users } = await useFetch<User[]>(`/api/users`, {
  transform: function (users) {
    return Object.values(users)
  },
})
</script>
