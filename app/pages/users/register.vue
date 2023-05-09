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
        <PvInputText v-model="username" placeholder="someone" class="max-w-md" :class="{ 'p-invalid': usernameError }" />
        <small class="text-red-600">{{ usernameError || '&nbsp;' }}</small>
      </p>
      <p class="my-4 flex flex-col space-y-2">
        <label for="email">Email</label>
        <PvInputText id="email" v-model="email" placeholder="someone@unb.ca" class="max-w-md" :class="{ 'p-invalid': emailError }" />
        <small class="text-red-600">{{ emailError || '&nbsp;' }}</small>
      </p>
      <p class="space-x-2">
        <button class="border-2 border-black bg-black p-3 text-white disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-400" type="submit" :disabled="!(!usernameError && !emailError)">
          Submit
        </button>
        <button class="border-2 border-black p-3">
          <a href="/users">Cancel</a>
        </button>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'

definePageMeta({
  auth: {
    public: false,
    redirect: true,
  },
})

const { value: username, errorMessage: usernameError } = useField(`username`, async function (username: string) {
  if (username) {
    const { error } = await useFetch(`/api/users/${username}`)
    if (!error.value) {
      return `Username already exists`
    }
    return true
  }
  return true
})

const { value: email, errorMessage: emailError } = useField(`email`, function (email: string) {
  if (email && !email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
    return `Invalid email address`
  }
  return true
})

const submit = async function () {
  if (!usernameError.value && !emailError.value) {
    const { error } = await useFetch(`/api/users`, {
      method: `POST`,
      body: {
        username: username.value,
        email: email.value,
      },
    })

    if (!error.value) {
      navigateTo(`/users`)
    }
  }
}
</script>
