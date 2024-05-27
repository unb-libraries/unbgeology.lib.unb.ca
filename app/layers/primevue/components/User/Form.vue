<template>
  <EntityForm :entity="input" @save="onSave" @cancel="onCancel">
    <template #default="{ body }">
      <TwFormField label="Username">
        <TwInputText v-model="body.username" class="input-text-lg" :validator="validateUsername" :disabled="mode === `update`" />
      </TwFormField>
      <TwFormField label="Roles">
        <PvMultipleChoice v-model="body.roles" :options="roleOptions" />
      </TwFormField>
      <TwFormField v-if="mode === `update`" label="Status">
        <PvInputDropdown v-model="body.status" :options="statusOptions" class="input-select-lg" />
      </TwFormField>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type EntityJSONCreateBody, type User } from '@unb-libraries/nuxt-layer-entity'
type UserFormInput = Pick<User, `username`> & { roles: Record<string, boolean>, status: `active` | `blocked` }

const props = defineProps<{
  user?: User
}>()

const emits = defineEmits<{
  save: [user: EntityJSONCreateBody<User>]
  cancel: [],
}>()

const mode = computed(() => props.user ? `update` : `create`)
const roleOptions = [`editor`, `curator`, `migrator`, `sysadmin`, `sudo`]
const statusOptions = [`active`, `blocked`]

const input = reactive<UserFormInput>({
  username: props.user?.id ?? ``,
  roles: Object.fromEntries((props.user ?? { roles: [] }).roles.map(role => [role, true])),
  status: props.user?.active !== undefined ? props.user?.active ? `active` : `blocked` : `active`,
})

const { fetchByPK } = useEntityType<User>(`User`)
let usernameValidationTimeout: NodeJS.Timeout
async function validateUsername(username: string) {
  if (!username) {
    return `Username is required.`
  }
  try {
    if (usernameValidationTimeout) {
      clearTimeout(usernameValidationTimeout)
    }
    const { entity: user } = await fetchByPK(username)
    if (user.value) {
      return `User already exists.`
    }
    return true
  } catch (err: any) {
    return true
  }
}

function onSave(values: UserFormInput) {
  const user: EntityJSONCreateBody<User> = {
    ...props.user ? { self: props.user.self } : {},
    username: values.username,
    roles: Object.entries(values.roles).filter(([, role]) => role).map(([key]) => key),
    active: values.status === `active`,
  }
  emits(`save`, user)
}

function onCancel() {
  emits(`cancel`)
}
</script>
