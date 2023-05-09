<template>
  <section class="container mx-auto my-4">
    <h1 class="text-4xl">
      Users
    </h1>
  </section>
  <section class="container mx-auto">
    <SyTable v-if="users && users.length" :header="header" :rows="users" />
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

const header = {
  username: `Name`,
  email: `Email`,
}

const { data: users } = await useFetch<User[]>(`/api/users`, {
  transform: function (users) {
    return Object.values(users)
  },
})
</script>
