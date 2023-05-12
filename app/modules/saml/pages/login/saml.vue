<script setup lang="ts">
import { sendRedirect, readBody, createError } from "h3"

definePageMeta({
  middleware: [
    async function () {
      if (process.client) { return }

      const { $saml } = useNuxtApp()
      const event = useRequestEvent()

      const { method } = event.node.req
      if (method !== `POST`) {
        throw createError({ status: 405, statusText: `HTTP Method not allowed.` })
      }

      const { SAMLResponse, RelayState } = await readBody(event)
      if (!SAMLResponse) {
        throw createError({ status: 400, statusText: `SAMLResponse is required` })
      }

      const response = await $saml.validatePostResponseAsync({ SAMLResponse })
      const profile = response.profile?.attributes as SAMLProfile

      try {
        await $fetch(`/api/users/${profile.uid}`)
        event.context.session.uid = profile.uid
        return sendRedirect(event, RelayState || `/`, 302)
      } catch (error) {
        throw createError({ statusCode: 403, statusMessage: `You are not authorized.` })
      }
    },
  ],
})
</script>
