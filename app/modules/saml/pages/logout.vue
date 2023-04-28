<script setup lang="ts">
import { sendRedirect } from "h3"

definePageMeta({
  middleware: [
    function () {
      const event = useRequestEvent()
      event.context.session = null
      return sendRedirect(event, `/`, 302)
    },
  ],
})
</script>
