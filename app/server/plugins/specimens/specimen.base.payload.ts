import { Immeasurabibility, MeasurementCount, Status } from "~/types/specimen"
import { validationPatterns } from "~/server/documentTypes/Specimen"
import { require } from "~/layers/mongo/server/utils/api/payload"

export default defineMongooseReader(Specimen.Base, async (payload, { op }) => {
  const create = op === `create`

  const { type, status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
    type: requireIf(create, StringValidator),
  })

  const migrate = create && (status === Status.MIGRATED)

  // REFACTOR: Because URIEntityTypeValidator cannot authorize against the API, MatchValidator is used instead

  const { classification, collection, images, age, composition, measurements, collector, sponsor, loans, storage, creator, editor, created, updated, ...body } = await validateBody(payload, {
    objectIDs: optional(ArrayValidator(ObjectValidator({
      id: require(StringValidator),
      type: optional(StringValidator),
    }))),
    description: optional(StringValidator),
    classification: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    collection: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    images: optional(ArrayValidator(MatchValidator(/^\/api\/files\/[a-z0-9]{24}$/))),
    measurements: optional(ObjectValidator({
      count: EnumValidator(MeasurementCount),
      dimensions: optional(ArrayValidator(ArrayValidator(NumberValidator, { minLength: 3, maxLength: 3 }))),
      reason: optional(EnumValidator(Immeasurabibility)),
    })),
    date: optional(MatchValidator(validationPatterns.partialDate)),
    age: optional(OrValidator<string | number>(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/), NumberValidator)),
    composition: optional(ArrayValidator(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/))),
    origin: optional(ObjectValidator({
      latitude: NumberValidator,
      longitude: NumberValidator,
      accuracy: NumberValidator,
      name: StringValidator,
      description: StringValidator,
    })),
    pieces: optional(NumberValidator),
    partial: optional(BooleanValidator),
    collector: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    sponsor: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    loans: optional(ArrayValidator(ObjectValidator({
      received: optional(BooleanValidator),
      contact: optional(ObjectValidator({
        name: optional(StringValidator),
        affiliation: optional(StringValidator),
        email: optional(MatchValidator(validationPatterns.email)),
        phone: optional(MatchValidator(validationPatterns.phone)),
      })),
      start: optional(MatchValidator(validationPatterns.date)),
      end: optional(MatchValidator(validationPatterns.date)),
    }))),
    storage: optional(ArrayValidator(ObjectValidator({
      location: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
      dateIn: optional(MatchValidator(validationPatterns.date)),
      dateOut: optional(MatchValidator(validationPatterns.date)),
    }))),
    publications: optional(ArrayValidator(ObjectValidator({
      id: optional(StringValidator),
      citation: optional(StringValidator),
      abstract: optional(StringValidator),
      doi: optional(StringValidator),
    }))),
    market: optional(NumberValidator),
    creator: optional(MatchValidator(/^\/api\/users\/[a-z0-9]{24}$/)),
    editor: optional(MatchValidator(/^\/api\/users\/[a-z0-9]{24}$/)),
    created: optional(MatchValidator(validationPatterns.date)),
    updated: optional(MatchValidator(validationPatterns.date)),
  })

  return {
    ...body,
    pk: create ? `UNB-${`${Math.floor(Math.random() * 1000000)}`.padStart(8, `0`)}` : undefined,
    classification: classification && { _id: classification.substring(1).split(`/`).at(-1)! },
    kollektion: collection && { _id: collection.substring(1).split(`/`).at(-1)! },
    images: images?.map(uri => ({ _id: uri.substring(1).split(`/`).at(-1)! })),
    age: age && (typeof age === `string`
      ? { unit: { _id: age.substring(1).split(`/`).at(-1)! }, numeric: null }
      : { unit: null, numeric: age }),
    composition: composition && composition.map(c => ({ _id: c.substring(1).split(`/`).at(-1)! })),
    measurements: (measurements && Object.keys(measurements).length > 0 && {
      count: useEnum(MeasurementCount).valueOf(measurements.count),
      dimensions: measurements.dimensions,
      reason: measurements.reason && useEnum(Immeasurabibility).valueOf(measurements.reason),
    }) || undefined,
    // FIX: Without using URIEntityTypeValidator, the collector/sponsor model cannot be determined
    collector: collector && { _id: collector.substring(1).split(`/`).at(-1)! },
    // collectorModel: collector && Term.fullName,
    sponsor: sponsor && { _id: sponsor.substring(1).split(`/`).at(-1)! },
    // sponsorModel: sponsor && Term.fullName,
    loans: loans?.map(({ start, end, ...loan }) => ({
      ...loan,
      start: new Date(start).getUTCMilliseconds(),
      end: new Date(end).getUTCMilliseconds(),
    })),
    storage: storage?.map(({ location, dateIn, dateOut }) => ({
      location: location && location.substring(1).split(`/`).at(-1)!,
      dateIn: dateIn && new Date(dateIn).valueOf(),
      dateOut: dateOut && new Date(dateOut).valueOf(),
    })),
    status: status && useEnum(Status).valueOf(status),
    creator: creator && { _id: creator.substring(1).split(`/`).at(-1)! },
    editor: editor && { _id: editor.substring(1).split(`/`).at(-1)! },
    created: (migrate && created && new Date(created).valueOf()) || undefined,
    updated: (migrate && updated && new Date(updated).valueOf()) || undefined,
  }
})
