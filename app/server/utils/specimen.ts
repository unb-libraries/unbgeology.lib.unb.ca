import { EntityJSONBody } from "layers/base/types/entity"
import { Image as ImageEntity } from "layers/mongo/server/entityTypes/File"
import { type H3Event } from "h3"
import { type Specimen } from "types/specimen"

export async function readSpecimenBody(event: H3Event) {
  const {
    objectId,
    name,
    description,
    images: imageURIs,
    classifications: classificationURIs,
    dimensions,
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
    objectId,
    name,
    description,
    date,
    age,
    pieces,
    partial,
    composition,
    status,
  }

  if (imageURIs) {
    body.images = await ImageEntity.findManyByURI(imageURIs)
  }
  if (classificationURIs) {
    body.classifications = await Classification.findManyByURI(classificationURIs)
  }
  if (dimensions) {
    const { width, length } = dimensions
    if (width && length) {
      body.dimensions = { width, length }
    }
  }
  if (origin) {
    const { latitude, longitude, accuracy = 0, name, description } = origin
    if (latitude && longitude) {
      body.origin = { latitude, longitude, accuracy, name, description }
    }
  }
  if (collectorURI) {
    const collector = await User.findByURI(collectorURI)
    if (collector) {
      body.collector = `${collector._id}`
    }
  }
  if (sponsorURI) {
    const sponsor = await User.findByURI(sponsorURI)
    if (sponsor) {
      body.sponsor = `${sponsor._id}`
    }
  }
  if (Array.isArray(loans)) {
    body.loans = []
    for (const loan of loans) {
      const { organization: organizationURI } = loan
      loan.organization = await Organization.findByURI(organizationURI)
      body.loans.push(loan)
    }
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
      if (citation && abstract) {
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
