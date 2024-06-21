<template>
  <div>
    <TwInputRadioGroup v-model="count" :options="countOptions" class="flex flex-row space-x-6 py-4" />
    <InputSpecimenDimensions v-if="count & ~MeasurementCount.IMMEASURABLE" v-model="dimensions" :disabled="disabled" :placeholder="placeholder" />
    <PvInputDropdown v-else v-model="immeasurableReason" :options="immeasurabilityOptions" class="input-select-lg" />
  </div>
</template>

<script setup lang="ts">
import { Immeasurabibility, MeasurementCount, type Specimen } from '~/types/specimen'
type Measurement = Specimen[`measurements`]
type Dimensions = NonNullable<Measurement[`dimensions`]>[number]

const props = withDefaults(defineProps<{
  modelValue: Measurement
  pieces?: number
}>(), {
  pieces: 1,
})

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [value: Measurement]
}>()

const countOptions = useEnum(MeasurementCount).toTuples().map<[MeasurementCount, string]>(([key, label]) => [key, key === MeasurementCount.AGGREGATE ? `Smallest / Largest / Average` : titleCased(label)])
const count = computed<MeasurementCount>({
  get: () => useEnum(MeasurementCount).valueOf(props.modelValue?.count ?? MeasurementCount.INDIVIDUAL),
  set: (value: MeasurementCount) => emits(`update:modelValue`, {
    count: value,
    dimensions: value === MeasurementCount.IMMEASURABLE ? undefined : dimensions.value.map(([l, w, h]) => [l * 10, w * 10, h * 10]),
    reason: value !== MeasurementCount.IMMEASURABLE ? undefined : immeasurableReason.value,
  }),
})

const immeasurabilityOptions = useEnum(Immeasurabibility).toTuples().map<[Immeasurabibility, string]>(([key, label]) => [key, titleCased(label)])
const immeasurableReason = computed<Immeasurabibility | undefined>({
  get: () => props.modelValue?.reason ? Number(useEnum(Immeasurabibility).valueOf(props.modelValue?.reason)) : undefined,
  set: (value: Immeasurabibility | undefined) => emits(`update:modelValue`, {
    count: MeasurementCount.IMMEASURABLE,
    dimensions: [],
    reason: value,
  }),
})

const dimensions = computed<Dimensions[]>({
  get: () => (toRaw(props.modelValue?.dimensions) ?? []).map(([l, w, h]) => [l / 10, w / 10, h / 10]).slice(0, count.value === MeasurementCount.INDIVIDUAL ? props.pieces : count.value === MeasurementCount.AGGREGATE ? 3 : 1),
  set: (value: Dimensions[]) => emits(`update:modelValue`, {
    count: count.value,
    dimensions: value.map(([l, w, h]) => [l * 10, w * 10, h * 10]),
    reason: undefined,
  }),
})

const disabled = computed(() => (count.value === MeasurementCount.INDIVIDUAL && dimensions.value.length >= props.pieces) ||
  (count.value === MeasurementCount.AGGREGATE && dimensions.value.length >= 3) ||
    (count.value === MeasurementCount.CONTAINER && dimensions.value.length >= 1))

const placeholder = computed(() => {
  const msg = (piece: string) => `Enter the ${piece} piece's dimensions (LxWxH), e.g. 2.3x4.5x12.1`
  return count.value === MeasurementCount.INDIVIDUAL && dimensions.value.length < props.pieces
    ? msg(`next`)
    : count.value === MeasurementCount.AGGREGATE && dimensions.value.length < 3
      ? msg([`smallest`, `largest`, `average`][dimensions.value.length])
      : count.value === MeasurementCount.CONTAINER && dimensions.value.length < 1
        ? msg(`container`)
        : `You're done!`
})
</script>
