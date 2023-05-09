<template>
  <section class="container mx-auto my-4 flex flex-row justify-between">
    <h1 class="text-4xl">
      Register user
    </h1>
  </section>
  <section class="container mx-auto my-4">
    <div v-if="errorMessage" class="border-l-4 border-l-red-600 bg-red-200 p-3 text-red-800">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="submit">
      <p class="my-4 flex flex-col space-y-2">
        <label for="username">Username</label>
        <PvInputText v-model="username" placeholder="someone" class="max-w-md" />
      </p>
      <p class="my-4 flex flex-col space-y-2">
        <label for="email">Email</label>
        <PvInputText id="email" v-model="email" placeholder="someone@unb.ca" class="max-w-md" />
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
const errorMessage = ref(``)

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
    errorMessage.value = error.value.statusMessage as string
  }
}
</script>
