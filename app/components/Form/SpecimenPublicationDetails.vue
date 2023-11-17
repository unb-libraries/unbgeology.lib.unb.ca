<template>
  <PvDetailsPage v-if="publication">
    <PvEntityDetails :entity="publication" :fields="['citation', 'abstract']" label-class="text-md text-primary-60" item-class="my-2 first:mt-0 last:mb-0" />
    <template #actions>
      <button class="border-yellow text-yellow hover:bg-yellow hover:text-primary mb-1 w-full rounded-md border p-1" @click="showEditForm = true">
        Edit
        <PvModal v-if="showEditForm">
          <FormPublication :publication="publication" @save="updatedPublication => updatePublication(updatedPublication)" @cancel="showEditForm = false" />
        </PvModal>
      </button>
      <button class="border-red text-red hover:bg-red mt-1 w-full rounded-md border p-1 hover:text-white" @click="showConfirmModal = true">
        Delete
        <PvModalConfirm v-if="showConfirmModal" modal-class="top-1/2" content-class="text-center text-2xl" @confirm="removePublication(publication)" @cancel="showConfirmModal = false">
          Are you sure you want to delete this publication?
        </PvModalConfirm>
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { EntityJSONBody, type EntityJSON } from 'layers/base/types/entity'
import { type Publication } from 'types/specimen'

const { slug } = useRoute().params
const publicationId = inject<string>(`context`)
const { fetchByPK, update, remove } = useEntityType<Publication>(Symbol(`specimens/${slug}/publications`))
const { entity: publication } = await fetchByPK(publicationId as string)

const showConfirmModal = ref(false)
const showEditForm = ref(false)

function updatePublication(loan: EntityJSONBody<Publication>) {
  update(loan)
  showEditForm.value = false
}

function removePublication(publication: EntityJSON<Publication>) {
  remove(publication)
  showConfirmModal.value = false
}
</script>
