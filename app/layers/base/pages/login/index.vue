<script setup lang="ts">
import { sendRedirect } from "h3"

definePageMeta({
  middleware: [
    async function (from, to) {
      if (process.client) { return }

      const { $saml } = useNuxtApp()
      const event = useRequestEvent()

      const { host } = event.node.req.headers
      const redirect = from.query.redirect as string
      const params = redirect
        ? {
            additionalParams: {
              RelayState: redirect,
            },
          }
        : {}

      $saml.init(useRuntimeConfig().public.saml)
      const samlUrl = await $saml.getAuthUrl(host!, params)
      return sendRedirect(event, samlUrl, 302)
    },
  ],
})
</script>
