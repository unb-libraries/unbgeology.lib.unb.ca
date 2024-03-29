<template>
  <EntityForm :entity="entity">
    <template #default="{ body: personBody }">
      <div class="form-row form-row-2">
        <div class="form-field">
          <label for="title">Title</label>
          <PvInputSelect
            v-model="personBody.title"
            class="form-input form-input-pvselect"
            name="title"
            :options="titleOptions"
            option-value="0"
            option-label="1"
            :show-clear="true"
          />
        </div>
        <div class="form-field">
          <div class="form-field">
            <label for="pronouns">Pronouns</label>
            <PvInputSelect
              v-model="personBody.pronouns"
              class="form-input form-input-pvselect"
              name="pronouns"
              :options="pronounOptions"
              option-value="0"
              option-label="1"
              :show-clear="true"
            />
          </div>
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-field">
          <label for="firstName">First name</label>
          <PvInputText v-model="personBody.firstName" class="form-input form-input-text" name="firstName" />
        </div>
        <div class="form-field">
          <label for="lastName">Last name</label>
          <PvInputText v-model="personBody.lastName" class="form-input form-input-text" name="lastName" />
        </div>
      </div>
      <div class="form-field">
        <label for="image">Image</label>
        <PvInputImageGallery v-model="personBody.image" :images="images" :multi="false" class="border-primary-20 dark:border-primary-60/75 hover:border-accent-light h-full rounded-lg border p-3" />
      </div>
      <div class="form-row form-row-2">
        <div class="form-field">
          <label for="occupation">Occupation</label>
          <PvInputText v-model="personBody.occupation" class="form-input form-input-text" name="occupation" />
        </div>
        <div class="form-field">
          <label for="position">Position</label>
          <PvInputText v-model="personBody.position" class="form-input form-input-text" name="position" />
        </div>
      </div>
      <div class="form-field">
        <label for="bio">Bio</label>
        <textarea v-model="personBody.bio" class="form-input form-input-textarea" name="bio" rows="10" />
      </div>
      <div class="form-row form-row-2">
        <div class="form-field">
          <label for="email">Email</label>
          <PvInputText v-model="personBody.email" class="form-input form-input-text" name="email" />
        </div>
        <div class="form-field">
          <label for="phone">Phone</label>
          <PvInputText v-model="personBody.phone" class="form-input form-input-text" name="phone" />
        </div>
      </div>
      <div class="form-field">
        <label for="website">Website</label>
        <PvInputText v-model="personBody.web" class="form-input form-input-text" name="website" />
      </div>
      <PvCheckbox id="active" v-model="personBody.active" label="Active" name="active" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Person, Title, Pronouns } from "types/affiliation"
import { type EntityJSONProperties, type Image } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  entity: EntityJSONProperties<Person>
}>()

const { entities: images } = await fetchEntityList<Image>(`Image`)

const titleOptions = [
  [`${Title.MR}`, `Mr.`],
  [`${Title.MS}`, `Ms.`],
  [`${Title.MRS}`, `Mrs.`],
  [`${Title.DR}`, `Dr.`],
  [`${Title.PROF}`, `Prof.`],
  [`${Title.DR | Title.PROF}`, `Prof. Dr.`],
]

const pronounOptions = [
  [`${Pronouns.HE}`, `He/Him`],
  [`${Pronouns.SHE}`, `She/Her`],
  [`${Pronouns.THEY}`, `They/Them`],
]
</script>
