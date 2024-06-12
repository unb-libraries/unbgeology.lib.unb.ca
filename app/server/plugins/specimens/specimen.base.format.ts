import { type User as UserEntity } from "@unb-libraries/nuxt-layer-entity"
import User from "~/layers/mongo/server/documentTypes/User"
import { type Affiliate } from "~/types/affiliate"
import { type StorageLocation } from "~/types/storagelocation"
import { Immeasurabibility, MeasurementCount, Status } from "~/types/specimen"

export default defineMongooseFormatter(Specimen.Base, async (doc) => {
  const { slug, objectIDs, classification, description, collection, images, measurements, date, age, composition, origin, pieces, partial, collector, sponsor, loans, storage, storageLocations, publications, market, status, creator, editor, created, updated } = doc

  const $return = {
    id: slug,
    objectIDs: objectIDs && objectIDs.map(({ id, type }) => ({ id, type })),
    classification: (classification && Object.keys(classification).length > 0 && await renderDocument(classification, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    description,
    collection: (collection && Object.keys(collection).length > 0 && await renderDocument(collection, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    images: images && await renderDocumentList(images, {
      model: FileBase,
      canonical: {
        self: img => `/api/files/${img._id}`,
      },
      pageSize: 10,
      self: () => `/api/files`,
    }),
    composition: composition && await renderDocumentList(composition, {
      model: Term,
      canonical: {
        self: term => `/api/terms/${term._id}`,
      },
      pageSize: 10,
      self: term => `/api/terms`,
    }),
    measurements: measurements && {
      count: useEnum(MeasurementCount).labelOf(measurements.count),
      dimensions: measurements.dimensions,
      reason: measurements.reason && useEnum(Immeasurabibility).labelOf(measurements.reason),
    },
    date,
    age: (age && ((age.unit && Object.keys(age.unit).length > 0) || age.numeric) && {
      unit: (age.unit && Object.keys(age.unit).length > 0 && await renderDocument(age.unit, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
      numeric: age.numeric,
    }) || undefined,
    origin,
    pieces,
    partial,
    collector: (collector && Object.keys(collector).length > 0 && await renderDocument(collector, { model: Term, self: term => `/api/terms/${term._id}` })) as Affiliate || undefined,
    sponsor: (sponsor && Object.keys(sponsor).length > 0 && await renderDocument(sponsor, { model: Term, self: term => `/api/terms/${term._id}` })) as Affiliate || undefined,
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
    storage: (storage && storage.length > 0 && await Promise.all(storage
      .map(({ location, ...s }) => ({ location: storageLocations.find(sl => `${sl._id}` === `${location._id}`), ...s }))
      .map(async ({ location, dateIn, dateOut }, index) => ({
        id: index + 1,
        location: location && Object.keys(location).length > 0 && await renderDocument(location, { model: Term, self: term => `/api/terms/${term._id}` }) as StorageLocation,
        dateIn: (!isNaN(dateIn) && new Date(dateIn).toISOString()) || undefined,
        dateOut: (dateOut && (!isNaN(dateOut!) && new Date(dateOut!).toISOString())) || undefined,
      })),
    )) || undefined,
    publications: publications && publications.map(({ id, citation, abstract, doi }) => ({
      id,
      citation,
      abstract,
      doi,
    })),
    market,
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    creator: (creator && Object.keys(creator).length > 0 && await renderDocument(creator, { model: User, self: user => `/api/users/${user.username}` }) as UserEntity) || undefined,
    editor: (editor && Object.keys(editor).length > 0 && await renderDocument(editor, { model: User, self: user => `/api/users/${user.username}` }) as UserEntity) || undefined,
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }

  // console.log(`$return`, $return)

  return $return
})
