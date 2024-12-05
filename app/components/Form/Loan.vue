<template>
  <EntityForm
    :entity="loan"
    @save="onSave"
    @cancel="onCancel"
  >
    <TwFormField label="Type">
      <TwInputRadioGroup
        v-model="loan.type"
        :options="useEnum(LoanType).toTuples().map(([value, label]) => [value, `${label[0]}${label.slice(1).toLowerCase()}`])"
        class="w-full flex-row space-x-3"
        item-class="w-1/2 border border-primary-60/40 hover:border-accent-light rounded-md bg-primary flex flex-row items-center text-primary-60 hover:text-base"
        selected-item-class="!text-base !border-accent-mid"
        input-class="ml-6"
        label-class="w-full pr-6 py-4 h-full"
      >
        <template #label="{ option, label }">
          <div class="flex w-full flex-row items-center justify-between space-x-4">
            <div>{{ label }}</div>
            <IconFolderInput
              v-if="option === LoanType.INCOMING"
              class="size-12 stroke-current stroke-1"
            />
            <IconFolderOutput
              v-if="option === LoanType.OUTGOING"
              class="size-12 stroke-current stroke-1"
            />
          </div>
        </template>
      </TwInputRadioGroup>
    </TwFormField>

    <div class="flex w-full flex-row gap-x-3">
      <TwFormField
        label="Start"
        class="w-1/2"
      >
        <TwInputText
          v-model="loan.start"
          class="input input-text-lg"
        />
      </TwFormField>

      <TwFormField
        label="End"
        class="w-1/2"
      >
        <TwInputText
          v-model="loan.end"
          class="input input-text-lg"
        />
      </TwFormField>
    </div>

    <TwFormField label="Description">
      <TwInputTextArea
        v-model="loan.description"
        class="input input-text-lg"
      />
    </TwFormField>

    <TwFormField label="Specimens">
      <PvInputDropdown
        v-model="loan.specimens"
        :options="specimenOpts"
        :input="true"
        :multi="true"
        class="input-select-lg"
        @input="onSearchSpecimens"
      >
        <template #item="{ options: [, [id, name]] }">
          <span>{{ name }} ({{ `${id}`.toUpperCase() }})</span>
        </template>
        <template #selected-item="{ label: [id] }">
          <span>{{ `${id}`.toUpperCase() }}</span>
        </template>
      </PvInputDropdown>
    </TwFormField>

    <!-- Contact -->
    <div class="space-y-4">
      <h2 class="input-label">
        Contact
      </h2>
      <div class="bg-primary-80/40 border-primary-80 focus:border-primary-60 hover:border-primary-60 space-y-4 rounded-lg border p-8">
        <TwFormField
          label="Name"
          class="w-full"
        >
          <TwInputText
            v-model="loan.contact.name"
            class="input input-text-lg w-full"
          />
        </TwFormField>
        <TwFormField
          label="Affiliation"
          class="w-full"
        >
          <TwInputText
            v-model="loan.contact.affiliation"
            class="input input-text-lg w-full"
          />
        </TwFormField>
        <div class="flex w-full flex-row space-x-4">
          <TwFormField
            label="Email"
            class="w-full"
          >
            <TwInputText
              v-model="loan.contact.email"
              class="input input-text-lg w-full"
            />
          </TwFormField>
          <TwFormField
            label="Phone"
            class="w-full"
          >
            <TwInputText
              v-model="loan.contact.phone"
              class="input input-text-lg w-full"
            />
          </TwFormField>
        </div>
      </div>
    </div>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator, type EntityJSONBody, type EntityJSONProperties } from "@unb-libraries/nuxt-layer-entity"
import { type Loan, LoanType } from 'types/loan'
import type { Specimen } from "~/types/specimen"

const props = defineProps<{
  entity?: EntityJSONProperties<Loan>
}>()

const emits = defineEmits<{
  save: [loan: EntityJSONBody<Loan>]
  cancel: []
}>()

const loan = reactive({
  description: props.entity?.description,
  start: props.entity?.start?.slice(0, 10),
  end: props.entity?.end?.slice(0, 10),
  contact: {
    name: props.entity?.contact.name,
    affiliation: props.entity?.contact.affiliation,
    email: props.entity?.contact.email,
    phone: props.entity?.contact.phone,
  },
  type: props.entity?.type ? useEnum(LoanType).valueOf(props.entity.type as LoanType | `incoming` | `outgoing`) : undefined,
  specimens: props.entity?.specimens?.map(({ self }) => self) ?? [],
  contract: props.entity?.contract?.self,
})

const { fetchAll } = useEntityType<Specimen>(`Specimen`)
const specimenOpts = ref<[string, [string, string]][]>(props.entity?.specimens?.map(({ self, id, name }) => [self, [id, name]]) ?? [] as [string, [string, string]][])

async function onSearchSpecimens(search: string) {
  specimenOpts.value = [
    ...(specimenOpts.value.filter(([self]) => loan.specimens.includes(self))),
    ...((search && (await fetchAll({ search })).entities.value.map(({ self, id, name }) => [self, [id, name]])) || []),
  ].filter(([self], i, arr) => arr.findIndex(([opt]) => opt === self) === i) as [string, [string, string]][]
}

function onSave(loan: EntityJSONBody<Loan>) {
  emits(`save`, {
    ...loan,
    start: new Date(loan.start).toISOString().slice(0, 10),
    end: new Date(loan.end).toISOString().slice(0, 10),
    type: loan.type === LoanType.INCOMING ? `incoming` : `outgoing`,
  })
}

function onCancel() {
  emits(`cancel`)
}
</script>
