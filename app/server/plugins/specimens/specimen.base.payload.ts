import { type User } from "@unb-libraries/nuxt-layer-entity"
import { Immeasurabibility, MeasurementType, ObjectIDType, Status } from "~/types/specimen"
import { validationPatterns } from "~/server/documentTypes/Specimen"
import { require } from "~/layers/mongo/server/utils/api/payload"
import { type Affiliate } from "~/types/affiliate"

export default defineMongooseReader(Specimen.Base, async (payload, { op }) => {
  const create = op === `create`

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
    type: requireIf(create, StringValidator),
  })

  const migrate = status === Status.MIGRATED
  const draft = !status || status === Status.DRAFT

  const { objectIDs, images, age, measurements, collector, sponsor, loans, storage, created, updated, ...body } = await validateBody(payload, {
    objectIDs: optional(ArrayValidator(ObjectValidator({
      id: require(StringValidator),
      primary: optional(BooleanValidator),
      type: optional(EnumValidator(ObjectIDType)),
    }))),
    description: requireIf(create && !(migrate || draft), StringValidator),
    images: optional(ArrayValidator(URIEntityTypeValidator(`image`))),
    measurements: requireIf(create && !(migrate || draft), ArrayValidator(ObjectValidator({
      type: require(EnumValidator(MeasurementType)),
      dimensions: optional(ArrayValidator(NumberValidator, { minLength: 3, maxLength: 3 })),
      reason: optional(EnumValidator(Immeasurabibility)),
    }))),
    date: optional(MatchValidator(validationPatterns.partialDate)),
    age: requireIf(create && !(migrate || draft), ObjectValidator({
      relative: optional(URIEntityTypeValidator(`geochronology`)),
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
    collector: optional(URIEntityTypeValidator<Affiliate>(`person`, `organization`)),
    sponsor: optional(URIEntityTypeValidator<Affiliate>(`person`, `organization`)),
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
      location: require(URIEntityTypeValidator(`storageLocation`)),
      dateIn: requireIf(!migrate, MatchValidator(validationPatterns.date)),
      dateOut: optional(MatchValidator(validationPatterns.date)),
    }))),
    publications: optional(ArrayValidator(ObjectValidator({
      citation: require(StringValidator),
      abstract: optional(StringValidator),
      doi: optional(MatchValidator(validationPatterns.doi)),
    }))),
    creator: requireIf(create, URIEntityTypeValidator<User>(`user`)),
    editor: requireIf(create, URIEntityTypeValidator<User>(`user`)),
    created: optional(MatchValidator(validationPatterns.date)),
    updated: optional(MatchValidator(validationPatterns.date)),
  })

  const defaultObjectID = {
    id: `UNB-${`${Math.floor(Math.random() * 1000000)}`.padStart(8, `0`)}`,
    primary: (objectIDs?.find(id => id.primary)) === undefined,
    type: ObjectIDType.INTERNAL,
  }

  return {
    ...body,
    objectIDs: (create ? (objectIDs ?? []).concat(defaultObjectID) : objectIDs)?.map(({ type, ...objectID }) => ({
      ...objectID,
      type: type && useEnum(ObjectIDType).valueOf(type),
    })),
    images: images?.map(({ id }) => ({ _id: id })),
    age: age && {
      relative: age.relative && { _id: age.relative.id },
      numeric: age.numeric,
    },
    measurements: measurements?.map(({ type, reason, dimensions }) => ({
      type: useEnum(MeasurementType).valueOf(type),
      dimensions: dimensions as [number, number, number],
      reason: reason && useEnum(Immeasurabibility).valueOf(reason),
    })),
    collector: collector && { _id: collector.id },
    collectorModel: (collector && collector.type === `person` && Affiliate.Person.fullName) ||
      (collector && collector.type === `organization` && Affiliate.Organization.fullName),
    sponsor: sponsor && { _id: sponsor.id },
    loans: loans?.map(({ start, end, ...loan }) => ({
      ...loan,
      start: new Date(start).getUTCMilliseconds(),
      end: new Date(end).getUTCMilliseconds(),
    })),
    storage: {
      locations: storage?.map(({ location }) => ({ _id: location.id })),
      dates: storage?.map(({ dateIn, dateOut }) => ({
        dateIn: dateIn && new Date(dateIn).valueOf(),
        dateOut: dateOut && new Date(dateOut).valueOf(),
      })),
    },
    status: status && useEnum(Status).valueOf(status),
    created: ((migrate && created) && new Date(created).valueOf()) || undefined,
    updated: ((migrate && updated) && new Date(updated).valueOf()) || undefined,
  }
})
