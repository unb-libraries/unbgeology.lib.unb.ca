import { type User as UserEntity } from "@unb-libraries/nuxt-layer-entity"
import User from "~/layers/mongo/server/documentTypes/User"
import { type Affiliate } from "~/types/affiliate"
import { type StorageLocation } from "~/types/storagelocation"
import { Immeasurabibility, MeasurementType, ObjectIDType, Status } from "~/types/specimen"

export default defineMongooseFormatter(Specimen.Base, async (doc) => {
  const { slug, objectIDs, description, images, measurements, date, age, origin, pieces, partial, collector, sponsor, loans, storage, publications, status, creator, editor, created, updated } = doc
  return {
    id: slug,
    objectIDs: objectIDs && objectIDs.map(({ id, primary, type }) => ({
      id,
      primary,
      type: useEnum(ObjectIDType).labelOf(type!).toLowerCase() as ObjectIDType,
    })),
    description,
    images: images && await renderDocumentList(images, {
      model: FileBase,
      canonical: {
        self: img => `/api/files/${img._id}`,
      },
      pageSize: 5,
      self: () => `/api/files`,
    }),
    measurements: measurements && measurements.map(({ type, dimensions, reason }) => ({
      type: useEnum(MeasurementType).labelOf(type) as MeasurementType,
      dimensions: dimensions as [number, number, number] | undefined,
      reason: reason && useEnum(Immeasurabibility).labelOf(reason) as Immeasurabibility,
    })),
    date,
    age: (age && ((age.relative && Object.keys(age.relative).length > 0) || age.numeric) && {
      relative: (age.relative && Object.keys(age.relative).length > 0 && await renderDocument(age.relative, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
      numeric: age.numeric,
    }) || undefined,
    origin,
    pieces,
    partial,
    collector: (collector && Object.keys(collector).length > 0 && await renderDocument(collector, { model: Term, self: term => `/api/terms/${term._id}` })) as Affiliate || undefined,
    sponsor: (sponsor && Object.keys(sponsor).length > 0 && await renderDocument(sponsor, { self: term => `/api/terms/${term._id}` })) as Affiliate || undefined,
    loans: loans && loans.map(loan => ({
      received: loan.received,
      contact: loan.contact && {
        name: loan.contact.name,
        affiliation: loan.contact.affiliation,
        email: loan.contact.email,
        phone: loan.contact.phone,
      },
      start: loan.start && new Date(loan.start).toISOString(),
      end: loan.end && new Date(loan.end).toISOString(),
    })),
    storage: storage && (storage.locations?.length > 0 || storage.dates?.length > 0) && await Promise.all(Array.from({ length: storage.locations?.length || storage.dates?.length }).map(async (_, index) => ({
      location: storage.locations?.[index] && await renderDocument(storage.locations[index], { model: Term, self: term => `/api/terms/${term._id}` }) as StorageLocation,
      dateIn: (!isNaN(storage.dates?.[index].dateIn) && new Date(storage.dates[index].dateIn).toISOString()) || undefined,
      dateOut: (storage.dates?.[index].dateOut && (!isNaN(storage.dates[index].dateOut!) && new Date(storage.dates[index].dateOut!).toISOString())) || undefined,
    }))),
    publications: publications && publications.map(({ citation, abstract, doi }) => ({
      citation,
      abstract,
      doi,
    })),
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    creator: (creator && Object.keys(creator).length > 0 && await renderDocument(creator, { model: User, self: user => `/api/users/${user.username}` }) as UserEntity) || undefined,
    editor: (editor && Object.keys(editor).length > 0 && await renderDocument(editor, { model: User, self: user => `/api/users/${user.username}` }) as UserEntity) || undefined,
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
