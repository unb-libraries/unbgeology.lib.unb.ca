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

      const { profile } = await $saml.validatePostResponseAsync({ SAMLResponse })
      if (profile?.uid) {
        event.context.session.uid = profile.uid
      }
      return sendRedirect(event, RelayState || `/`, 302)
    },
  ],
})
</script>
