<script setup lang="ts">
import { sendRedirect, useSession } from "h3"

definePageMeta({
  middleware: [
    async function () {
      const event = useRequestEvent()

      const sessionConfig = useSessionConfig()
      const { update } = await useSession(event, sessionConfig)
      await update((data) => {
        delete data.user
        return data
      })

      return sendRedirect(event, `/`, 302)
    },
  ],
})
</script>
