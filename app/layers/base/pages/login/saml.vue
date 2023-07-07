<script setup lang="ts">
import { sendRedirect, readBody, createError, useSession, deleteCookie } from "h3"
import type { SAMLProfile } from "~/types/saml"

definePageMeta({
  middleware: [

    // Initialize
    function () {
      if (process.client) { return }

      const event = useRequestEvent()
      const { method } = event.node.req
      if (method !== `POST`) {
        throw createError({ status: 405, statusText: `HTTP Method not allowed.` })
      }
    },

    // Process SAML response
    async function () {
      if (process.client) { return }

      const { $saml } = useNuxtApp()
      const event = useRequestEvent()

      const { SAMLResponse, RelayState = `/` } = await readBody(event)
      if (!SAMLResponse) {
        throw createError({ status: 400, statusText: `SAMLResponse is required` })
      }

      event.context.saml = {
        profile: await $saml.getProfile(SAMLResponse),
        RelayState,
      }
    },

    // Update the user with the profile retrieved from the IDP
    async function () {
      if (process.client) { return }

      const event = useRequestEvent()

      const sessionConfig = useSessionConfig()
      const session = await useSession(event, sessionConfig)
      const {
        uid: username,
        mail: email,
        telephoneNumber: phone,
        sn: lastName,
        givenName: firstName,
      } = event.context.saml.profile as SAMLProfile

      await session.update({
        user: username,
        validUntil: new Date().valueOf() + sessionConfig.maxAge * 1000,
      })

      const setCookies = event.node.res.getHeader(`set-cookie`) as string | string[] ?? ``
      const authSessionCookie = Array.isArray(setCookies)
        ? setCookies.find(cookie => cookie.startsWith(sessionConfig.name)) ?? ``
        : setCookies

      try {
        await $fetch(`/api/users/${username}`, {
          method: `PUT`,
          body: {
            email,
            phone,
            lastName,
            firstName,
          },
          headers: {
            Cookie: authSessionCookie,
          },
        })
      } catch (error) {
        event.context.saml.RelayState = `/`
        deleteCookie(event, sessionConfig.name)
      }
    },

    // Redirect the user
    function () {
      if (process.client) { return }

      const event = useRequestEvent()
      return sendRedirect(event, event.context.saml.RelayState, 302)
    },
  ],
})
</script>
