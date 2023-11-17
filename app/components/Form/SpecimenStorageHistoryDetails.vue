<template>
  <PvDetailsPage>
    <PvEntityList :entities="history" item-class="my-4 first:mt-0 last:mb-0 border-b border-primary-80 pb-4 last:border-b-0">
      <template #default="{ entity: storage }">
        <PvEntityDetails :entity="storage" :fields="[`date`, `location`]" item-class="my-2 first:mt-0 last:mb-0" label-class="text-md text-primary-60">
          <template #date>
            {{ `${storage.dateIn} - ${storage.dateOut ?? `present`}` }}
          </template>
          <template #location>
            {{ storage.location.label }}
          </template>
        </PvEntityDetails>
      </template>
    </PvEntityList>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { type Storage } from 'types/specimen'

const { slug } = useRoute().params
const { fetchAll } = useEntityType<Storage>(Symbol(`specimens/${slug}/storage`))
const { list } = await fetchAll()
const history = computed(() => list.value?.entities ?? [])
</script>
