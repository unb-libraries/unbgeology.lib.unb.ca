<script setup lang="ts">
definePageMeta({
  name: `Sponsors & Collectors`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:affiliate(:person|:organization)?)?/,
  },
  menu: {
    weight: 70,
  },
})

navigateTo(`/dashboard/collectors-sponsors/people`)
</script>
