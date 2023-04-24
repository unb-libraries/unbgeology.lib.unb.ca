<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      const event = useRequestEvent()
      event.context.session = null
      return navigateTo({ path: `/` })
    },
  ],
})
</script>
