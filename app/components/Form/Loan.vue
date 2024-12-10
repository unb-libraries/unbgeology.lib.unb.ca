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
          placeholder="YYYY-MM-DD"
          class="input input-text-lg"
        />
      </TwFormField>

      <TwFormField
        label="End"
        class="w-1/2"
      >
        <TwInputText
          v-model="loan.end"
          placeholder="YYYY-MM-DD"
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
        :disabled="!loan.type"
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

    <TwFormField label="Contract">
      <div
        v-if="loan.contract"
        class="bg-primary border-primary-80 flex flex-row justify-between rounded-md border p-3"
      >
        <div class="flex items-center justify-start space-x-3">
          <div><IconFileText class="size-8 stroke-current stroke-1" /></div>
          <div>
            {{ loan.contract.filename.slice(loan.contract.filename.indexOf(`-`) + 1) }}
          </div>
        </div>
        <button
          class="bg-primary-80 hover:bg-primary-60 rounded-md p-1 hover:cursor-pointer"
          @click.stop.prevent="loan.contract = undefined"
        >
          <IconCancel class="stroke-primary-20 size-6 stroke-2" />
        </button>
      </div>
      <button
        v-else
        class="button button-outline-primary-60 hover:button-outline-accent-light button-lg hover:bg-primary bg-primary flex w-full flex-col space-y-2 border-dashed p-8"
        @click.stop.prevent="onClickFileBrowse"
      >
        <IconFileText class="size-12 fill-none stroke-current" />
        <span>
          Browse documents
        </span>
      </button>
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="tsx">
import { FilterOperator, type EntityJSONBody, type EntityJSONProperties } from "@unb-libraries/nuxt-layer-entity"
import { type Loan, LoanType } from 'types/loan'
import { TwDocumentBrowser } from "#components"
import { Legal, type Specimen } from "~/types/specimen"

const props = defineProps<{
  entity?: EntityJSONProperties<Loan>
}>()

const emits = defineEmits<{
  save: [loan: Partial<EntityJSONBody<Loan>>]
  cancel: []
}>()

const { stackContent, unstackContent } = useModal()
const { createToast } = useToasts()

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
  contract: props.entity?.contract,
})

const { fetchAll: fetchSpecimens } = useEntityType<Specimen>(`Specimen`)
const specimenOpts = ref<[string, [string, string]][]>(props.entity?.specimens?.map(({ self, id, name }) => [self, [id, name]]) ?? [] as [string, [string, string]][])
async function onSearchSpecimens(search: string) {
  specimenOpts.value = [
    ...(specimenOpts.value.filter(([self]) => loan.specimens.includes(self))),
    ...((search && (await fetchSpecimens({ search, filter: [[`legal`, FilterOperator.EQUALS, useEnum(Legal).labelOf(loan.type === LoanType.INCOMING ? Legal.LOAN : Legal.PERMANENT)]] })).entities.value.map<[string, [string, string, Legal]]>(({ self, id, name, legal }) => [self, [id, name, useEnum(Legal).valueOf(legal)]])) || []),
  ].filter(([self], i, arr) => arr.findIndex(([opt]) => opt === self) === i) as [string, [string, string]][]
}

watch(() => loan.type, () => {
  specimenOpts.value = []
  loan.specimens = []
})

function onClickFileBrowse() {
  const document = ref(loan.contract)

  const onSelect = () => {
    loan.contract = document.value
    unstackContent()
  }

  stackContent(
    <div class="flex flex-col space-y-4">
      <TwDocumentBrowser
        onUpdate:modelValue={v => document.value = v}
      />
      <div class="inline-flex space-x-2">
        <button class="button button-lg button-accent-mid hover:button-accent-light" onClick={onSelect}>
          Select
        </button>
        <button class="button button-lg button-outline-primary-60 hover:button-outline-primary-40" onClick={unstackContent}>
          Cancel
        </button>
      </div>
    </div>,
  )
}

function onSave() {
  const { start, end, description, contact: { name, affiliation, email, phone }, type, specimens, contract } = loan
  if ([start, end, name, affiliation, email, phone, type, specimens].some(v => !v)) {
    createToast(`error-loan-create`, {
      message: `Please fill out all required fields`,
      type: `error`,
    })
    return
  }

  emits(`save`, {
    start: new Date(start!).toISOString().slice(0, 10),
    end: new Date(end!).toISOString().slice(0, 10),
    description,
    contact: {
      name: name!,
      affiliation: affiliation!,
      email: email!,
      phone: phone!,
    },
    type: loan.type === LoanType.INCOMING ? `incoming` : `outgoing`,
    specimens,
    contract: contract?.self,
  })
}

function onCancel() {
  emits(`cancel`)
}
</script>
