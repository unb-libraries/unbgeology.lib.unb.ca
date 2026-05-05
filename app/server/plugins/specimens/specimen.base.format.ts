import type { User as UserEntity } from "@unb-libraries/nuxt-layer-entity"
import User from "~/server/documentTypes/User"
import type { Affiliate } from "~/types/affiliate"
import { Immeasurabibility, Legal, MeasurementCount, Status } from "~/types/specimen"

export default defineMongooseFormatter(Specimen.Base, async (doc) => {
  const { slug, objectIDs, mimsyID, legal, lenderID, lenderURL, classification, name, description, kollektion, images, measurements, date, relativeAge, numericAge, composition, origin, pieces, partial, collector, sponsor, loans, storage, storageLocations, publications, appraisal, status, creator, editor, created, updated } = doc

  function getAuthHeaders(): { Cookie?: string } {
    const event = useEvent()
    if (event) {
      const sessionName = useRuntimeConfig().public.session.name
      return { Cookie: `${sessionName}=${getCookie(event, sessionName)}` }
    }
    return {}
  }

  return {
    id: slug,
    mimsyID,
    objectIDs: objectIDs && objectIDs.map(({ id, type }) => ({ id, type })),
    legal: legal && useEnum(Legal).labelOf(legal).toLowerCase(),
    lenderID,
    lenderURL,
    classification: (classification && Object.keys(classification).length > 0 && await $fetch(`/api/terms/${classification._id}`, { headers: getAuthHeaders() ?? {} })) || undefined,
    name,
    description,
    collection: (kollektion && Object.keys(kollektion).length > 0 && await renderDocument(kollektion, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
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
    age: ((relativeAge?.length || numericAge?.length) && {
      relative: (relativeAge?.length && await Promise.all(relativeAge.map(unit => $fetch(`/api/terms/${unit._id}`, { headers: getAuthHeaders() ?? {} })))) || undefined,
      numeric: (numericAge?.length && numericAge) || undefined,
    }) || undefined,
    origin,
    pieces,
    partial,
    collector: (collector && Object.keys(collector).length > 0 && await renderDocument(collector, { model: Term, self: term => `/api/terms/${term._id}` })) as Affiliate || undefined,
    sponsor: (sponsor && Object.keys(sponsor).length > 0 && await renderDocument(sponsor, { model: Term, self: term => `/api/terms/${term._id}` })) as Affiliate || undefined,
    storage: (storage && storage.length > 0 && await Promise.all(storage
      .map(({ location, ...s }) => ({ location: storageLocations.find(sl => `${sl._id}` === `${location._id}`), ...s }))
      .map(async ({ location, dateIn }, index) => ({
        id: index + 1,
        location: location && Object.keys(location).length > 0 && await $fetch(`/api/terms/${location._id}`, { headers: getAuthHeaders() ?? {} }),
        dateIn: (!isNaN(dateIn) && new Date(dateIn).toISOString()) || undefined,
      })),
    )) || undefined,
    publications: publications && publications.map(({ id, citation, abstract, doi }) => ({
      id,
      citation,
      abstract,
      doi,
    })),
    appraisal,
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    creator: (creator && Object.keys(creator).length > 0 && await renderDocument(creator, { model: User, self: user => `/api/users/${user.username}` }) as UserEntity) || undefined,
    editor: (editor && Object.keys(editor).length > 0 && await renderDocument(editor, { model: User, self: user => `/api/users/${user.username}` }) as UserEntity) || undefined,
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
