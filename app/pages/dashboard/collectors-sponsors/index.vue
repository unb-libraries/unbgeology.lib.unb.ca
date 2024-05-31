<script>
definePageMeta({
  name: `Sponsors & Collectors`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:affiliate(:(organization|person))?)?/,
  },
  menu: {
    weight: 70,
  },
})
navigateTo(`/dashboard/collectors-sponsors/organizations`)
</script>
