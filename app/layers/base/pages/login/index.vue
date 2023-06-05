<script setup lang="ts">
import { type RouteLocationNormalized } from 'vue-router'
import { sendRedirect } from "h3"

definePageMeta({
  middleware: [
    async function (from: RouteLocationNormalized, to: RouteLocationNormalized) {
      if (process.client) { return }

      const event = useRequestEvent()
      const { host } = event.node.req.headers
      // const { method } = event.node.req
      const { $saml } = useNuxtApp()

      const redirect = from.query.redirect as string
      const params = redirect
        ? {
            additionalParams: {
              RelayState: redirect,
            },
          }
        : {}
      const samlUrl = await $saml.getAuthorizeUrlAsync(``, host, params)
      return sendRedirect(event, samlUrl, 302)
    },
  ],
})
</script>
