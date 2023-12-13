<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo(`/dashboard/specimens`)
    },
  ],
})
</script>
