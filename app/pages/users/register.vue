<template>
  <section class="container mx-auto my-4 flex flex-row justify-between">
    <h1 class="text-4xl">
      Register user
    </h1>
  </section>
  <section class="container mx-auto my-4">
    <form @submit.prevent="submit">
      <p class="my-4 flex flex-col space-y-2">
        <label for="username">Username</label>
        <input v-model="username" class="max-w-md border" type="text" name="username">
      </p>
      <p class="my-4 flex flex-col space-y-2">
        <label for="email">Email</label>
        <input v-model="email" class="max-w-md border" type="email" name="email">
      </p>
      <button class="bg-black p-3 text-white" type="submit">
        Submit
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    public: false,
    redirect: true,
  },
})

const username = ref(``)
const email = ref(``)

const submit = async function () {
  const { error } = await useFetch(`/api/users`, {
    method: `POST`,
    body: {
      username: username.value,
      email: email.value,
    },
  })

  if (!error.value) {
    navigateTo(`/users`)
  } else {
    console.error(error.value)
  }
}
</script>
