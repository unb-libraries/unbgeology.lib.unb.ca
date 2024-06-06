import { Immeasurabibility, MeasurementType, Status } from "~/types/specimen"
import { validationPatterns } from "~/server/documentTypes/Specimen"
import { require } from "~/layers/mongo/server/utils/api/payload"

export default defineMongooseReader(Specimen.Base, async (payload, { op }) => {
  const create = op === `create`

  const { type, status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
    type: requireIf(create, StringValidator),
  })

  const migrate = status === Status.MIGRATED
  const draft = !status || status === Status.DRAFT

  // REFACTOR: Because URIEntityTypeValidator cannot authorize against the API, MatchValidator is used instead

  const { objectIDs, collection, images, age, measurements, collector, sponsor, loans, storage, creator, editor, created, updated, ...body } = await validateBody(payload, {
    objectIDs: optional(ArrayValidator(ArrayValidator(StringValidator, { minLength: 1, maxLength: 2 }))),
    description: requireIf(create && !(migrate || draft), StringValidator),
    collection: requireIf(create && !(migrate || draft), optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/))),
    images: optional(ArrayValidator(MatchValidator(/^\/api\/files\/[a-z0-9]{24}$/))),
    measurements: requireIf(create && !(migrate || draft), ArrayValidator(ObjectValidator({
      type: require(EnumValidator(MeasurementType)),
      dimensions: optional(ArrayValidator(NumberValidator, { minLength: 3, maxLength: 3 })),
      reason: optional(EnumValidator(Immeasurabibility)),
    }))),
    date: optional(MatchValidator(validationPatterns.partialDate)),
    age: requireIf(create && !(migrate || draft), ObjectValidator({
      relative: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
      numeric: optional(NumberValidator),
    })),
    origin: requireIf(create && !(migrate || draft), ObjectValidator({
      latitude: require(NumberValidator),
      longitude: require(NumberValidator),
      accuracy: optional(NumberValidator),
      name: require(StringValidator),
      description: optional(StringValidator),
    })),
    pieces: requireIf(create && !(migrate || draft), NumberValidator),
    partial: optional(BooleanValidator),
    collector: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    sponsor: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    loans: optional(ArrayValidator(ObjectValidator({
      received: require(BooleanValidator),
      contact: ObjectValidator({
        name: require(StringValidator),
        affiliation: require(StringValidator),
        email: require(MatchValidator(validationPatterns.email)),
        phone: require(MatchValidator(validationPatterns.phone)),
      }),
      start: require(MatchValidator(validationPatterns.date)),
      end: require(MatchValidator(validationPatterns.date)),
    }))),
    storage: optional(ArrayValidator(ObjectValidator({
      location: require(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
      dateIn: requireIf(!migrate, MatchValidator(validationPatterns.date)),
      dateOut: optional(MatchValidator(validationPatterns.date)),
    }))),
    publications: optional(ArrayValidator(ObjectValidator({
      id: require(StringValidator),
      citation: require(StringValidator),
      abstract: optional(StringValidator),
      doi: optional(MatchValidator(validationPatterns.doi)),
    }))),
    market: optional(NumberValidator),
    creator: requireIf(create, MatchValidator(/^\/api\/users\/[a-z0-9]{24}$/)),
    editor: optional(MatchValidator(/^\/api\/users\/[a-z0-9]{24}$/)),
    created: optional(MatchValidator(validationPatterns.date)),
    updated: optional(MatchValidator(validationPatterns.date)),
  })

  return {
    ...body,
    pk: create ? `UNB-${`${Math.floor(Math.random() * 1000000)}`.padStart(8, `0`)}` : undefined,
    objectIDs: objectIDs?.map(([id, type]) => ({ id, type })),
    classificationModel: type === `fossil`
      ? Classification.Fossil.fullName
      : type === `mineral`
        ? Classification.Mineral.fullName
        : Classification.Rock.fullName,
    collection: collection && { _id: collection.substring(1).split(`/`).at(-1)! },
    images: images?.map(uri => ({ _id: uri.substring(1).split(`/`).at(-1)! })),
    age: age && {
      relative: age.relative && { _id: age.relative.substring(1).split(`/`).at(-1)! },
      numeric: age.numeric,
    },
    measurements: measurements?.map(({ type, reason, dimensions }) => ({
      type: useEnum(MeasurementType).valueOf(type),
      dimensions: dimensions as [number, number, number],
      reason: reason && useEnum(Immeasurabibility).valueOf(reason),
    })),
    // FIX: Without using URIEntityTypeValidator, the collector/sponsor model cannot be determined
    collector: collector && { _id: collector.substring(1).split(`/`).at(-1)! },
    collectorModel: collector && Term.fullName,
    sponsor: sponsor && { _id: sponsor.substring(1).split(`/`).at(-1)! },
    sponsorModel: sponsor && Term.fullName,
    loans: loans?.map(({ start, end, ...loan }) => ({
      ...loan,
      start: new Date(start).getUTCMilliseconds(),
      end: new Date(end).getUTCMilliseconds(),
    })),
    storage: {
      locations: storage?.map(({ location }) => ({ _id: location.substring(1).split(`/`).at(-1)! })),
      dates: storage?.map(({ dateIn, dateOut }) => ({
        dateIn: dateIn && new Date(dateIn).valueOf(),
        dateOut: dateOut && new Date(dateOut).valueOf(),
      })),
    },
    status: status && useEnum(Status).valueOf(status),
    creator: creator && { _id: creator.substring(1).split(`/`).at(-1)! },
    editor: editor && { _id: editor.substring(1).split(`/`).at(-1)! },
    created: ((migrate && created) && new Date(created).valueOf()) || undefined,
    updated: ((migrate && updated) && new Date(updated).valueOf()) || undefined,
  }
})
