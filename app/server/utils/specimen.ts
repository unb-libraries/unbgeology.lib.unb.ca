import { EntityJSONBody } from "layers/base/types/entity"
import { Image as ImageEntity } from "layers/mongo/server/entityTypes/File"
import { type H3Event } from "h3"
import { type Specimen } from "types/specimen"

export async function readSpecimenBody(event: H3Event) {
  const {
    objectID,
    name,
    description,
    images: imageURIs,
    classifications: classificationURIs,
    measurements,
    date,
    age,
    origin,
    pieces,
    partial,
    composition,
    collector: collectorURI,
    sponsor: sponsorURI,
    loans,
    storage,
    publications,
    status,
    editor: userURI,
  } = await readBody<EntityJSONBody<Specimen>>(event)

  const body: Partial<EntityJSONBody<Specimen>> = {
    name,
    description,
    date,
    pieces,
    partial,
    composition,
    status,
  }

  if (objectID.unb) {
    body.objectID = {
      ...objectID,
      unb: objectID.unb,
    }
  }

  if (imageURIs) {
    body.images = await ImageEntity.findManyByURI(imageURIs)
  }
  if (classificationURIs) {
    body.classifications = await Classification.findManyByURI(classificationURIs)
  }
  if (Array.isArray(measurements)) {
    body.measurements = measurements
      .filter(({ width, length }) => width && length)
      .map(({ width, length }) => ({ width, length }))
  }
  if (age) {
    const { relative: unitURI, absolute } = age
    if (unitURI) {
      body.age = {
        relative: Geochronology.findByURI(unitURI),
        absolute,
      }
    }
  }
  if (origin) {
    const { latitude, longitude, accuracy = 0, name, description } = origin
    if (latitude && longitude) {
      body.origin = { latitude, longitude, accuracy, name, description }
    }
  }
  if (collectorURI) {
    const collector = await Person.findByURI(collectorURI)
    if (collector) {
      body.collector = `${collector._id}`
    }
  } else if (sponsorURI) {
    const sponsor = await Person.findByURI(sponsorURI)
    if (sponsor) {
      body.sponsor = `${sponsor._id}`
    }
  }
  if (Array.isArray(loans)) {
    body.loans = loans
  }
  if (Array.isArray(storage)) {
    body.storage = []
    for (const item of storage) {
      const { location: locationURI } = item
      item.location = await StorageLocation.findByURI(locationURI)
      body.storage.push(item)
    }
  }
  if (Array.isArray(publications)) {
    body.publications = []
    for (const publication of publications) {
      const { citation, abstract, doi } = publication
      if (citation) {
        body.publications.push({ citation, abstract, doi })
      }
    }
  }
  if (userURI) {
    const editor = await User.findByURI(userURI)
    if (editor) {
      body.editor = `${editor._id}`
    }
  }

  return body
}
